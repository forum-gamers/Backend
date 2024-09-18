import {
  BadGatewayException,
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { BaseController } from 'src/base/controller.base';
import { CommunityService } from './community.service';
import { CommunityValidation } from './community.validation';
import { ImageKitService } from 'src/third-party/imagekit/imagekit.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserMe } from '../user/decorators/me.decorator';
import { COMMUNITY_IMAGE_FOLDER } from './community.constant';
import { CreateCommunityDto } from './dto/create.dto';
import { Sequelize } from 'sequelize-typescript';
import { CommunityMemberService } from '../communityMember/communityMember.service';
import { CreateCommunityMemberDto } from '../communityMember/dto/create.dto';
import { RateLimitGuard } from 'src/middlewares/global/rateLimit.middleware';
import { type CommunityAttributes } from 'src/models/community';
import { CommunityContext } from './decorators/community.decorator';
import { PaginationPipe } from 'src/utils/pipes/pagination.pipe';
import { DiscordService } from '../discord/discord.service';
import { DiscordMeService } from 'src/third-party/discord/me.service';
import globalUtils from 'src/utils/global/global.utils';
import type { DiscordGuild } from 'src/third-party/discord/discord.interface';
import { RequiredField } from 'src/utils/pipes/requiredField.pipe';
import { DiscordOauthService } from 'src/third-party/discord/oauth.service';
import jwt, { TokenDiscordData } from 'src/utils/global/jwt.utils';
import { UserAttributes } from 'src/models/user';

@Controller('community')
export class CommunityController extends BaseController {
  constructor(
    private readonly communityService: CommunityService,
    private readonly communityValidation: CommunityValidation,
    private readonly imagekitService: ImageKitService,
    private readonly sequelize: Sequelize,
    private readonly communityMemberService: CommunityMemberService,
    private readonly discordService: DiscordService,
    private readonly discordMeService: DiscordMeService,
    private readonly discordOauthService: DiscordOauthService,
  ) {
    super();
  }

  @Post()
  @HttpCode(201)
  @UseGuards(
    new RateLimitGuard({
      windowMs: 5 * 60 * 1000,
      max: 10,
      message: 'Too many requests from this IP, please try again in 5 minutes.',
    }),
  )
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 2 * 1024 * 1024, // 2mb
      },
    }),
  )
  public async create(
    @UploadedFile() rawFile: Express.Multer.File | null,
    @UserMe('id') userId: string,
    @Body() payload: any,
  ) {
    const { name, description } =
      await this.communityValidation.validateCreate(payload);

    if (await this.communityService.findOneByName(name))
      throw new ConflictException('name already exist');

    const communityPayload = new CreateCommunityDto({
      name,
      description,
      owner: userId,
    });
    const transaction = await this.sequelize.transaction();
    try {
      if (rawFile) {
        const {
          file: { buffer, originalname },
        } = await this.communityValidation.validateCreateCommunityImage({
          file: rawFile,
        });

        const { url, fileId } = await this.imagekitService.uploadFile({
          file: buffer,
          fileName: originalname,
          useUniqueFileName: true,
          folder: COMMUNITY_IMAGE_FOLDER,
        });
        communityPayload.updateImage(url, fileId);
      }

      const community = await this.communityService.create(communityPayload, {
        transaction,
        returning: [
          'id',
          'imageUrl',
          'imageId',
          'description',
          'name',
          'owner',
          'createdAt',
          'updatedAt',
          'isDiscordServer',
        ],
      });
      await this.communityMemberService.create(
        new CreateCommunityMemberDto({
          userId,
          role: 'owner',
          communityId: community.id,
        }),
        {
          transaction,
        },
      );

      await transaction.commit();
      return this.sendResponseBody({
        message: 'successfully created',
        code: 201,
        data: community,
      });
    } catch (err) {
      if (communityPayload.imageId)
        this.imagekitService.bulkDelete([communityPayload.imageId]);
      await transaction.rollback();
      throw err;
    }
  }

  @Post('import-from-discord-server')
  @HttpCode(201)
  @UseGuards(
    new RateLimitGuard({
      windowMs: 5 * 60 * 1000,
      max: 10,
      message: 'Too many requests from this IP, please try again in 5 minutes.',
    }),
  )
  public async createByDiscordServer(
    @UserMe() user: UserAttributes,
    @Body('discordServerId', RequiredField) discordServerId: string,
  ) {
    const discordAccount = await this.discordService.findByUserId(user.id);
    if (!discordAccount)
      throw new NotFoundException('you have not linked discord account yet');

    let token: TokenDiscordData = {
      id: discordAccount.id,
      accessToken: discordAccount.accessToken,
      refreshToken: discordAccount.refreshToken,
      tokenExpires: Number(discordAccount.tokenExpires),
    };

    if (
      globalUtils.isExpires(
        Number(discordAccount.tokenExpires),
        Math.floor(discordAccount.updatedAt.getTime() / 1000),
      )
    ) {
      const { data, status } = await this.discordOauthService.refreshToken(
        discordAccount.refreshToken,
      );
      if (status !== 200 || !data)
        throw new BadGatewayException('failed to get new token');

      token = {
        ...token,
        accessToken: data?.access_token,
        refreshToken: data?.refresh_token,
        tokenExpires: Number(data?.expires_in),
      };
      this.discordService.updateData(discordAccount.id, {
        accessToken: data?.access_token,
        refreshToken: data?.refresh_token,
        tokenExpires: BigInt(data?.expires_in),
        imageUrl: discordAccount.imageUrl,
        backgroundUrl: discordAccount.backgroundUrl,
      }); //async
    }

    const { data = [] as DiscordGuild[] } =
      await this.discordMeService.getMyGuild(token.accessToken);

    const discordServer = data.find((el) => el.id === discordServerId);
    if (!discordServer) throw new NotFoundException('discord server not found');

    if (!discordServer.owner)
      throw new ForbiddenException('you are not owner of this discord server');

    const exists = await this.communityService.findOneByName(
      discordServer.name,
    );
    if (exists && exists.isDiscordServer)
      throw new ConflictException('community already exist');

    const communityPayload = new CreateCommunityDto({
      name: exists
        ? `${discordServer.name}${globalUtils.generateRandomNumber(6)}`
        : discordServer.name,
      owner: user.id,
      isDiscordServer: true,
    });

    const transaction = await this.sequelize.transaction();
    try {
      if (discordServer.icon) {
        const { url, fileId } = await this.imagekitService.uploadFile({
          file: `https://cdn.discordapp.com/icons/${discordServer.id}/${discordServer.icon}.png`,
          fileName: discordServer.name + '_profile.png',
          useUniqueFileName: true,
          folder: COMMUNITY_IMAGE_FOLDER,
        });
        communityPayload.updateImage(url, fileId);
      }
      const community = await this.communityService.create(communityPayload, {
        transaction,
        returning: [
          'id',
          'imageUrl',
          'imageId',
          'description',
          'name',
          'owner',
          'createdAt',
          'updatedAt',
          'isDiscordServer',
        ],
      });
      //TODO notify all server member
      await this.communityMemberService.create(
        new CreateCommunityMemberDto({
          userId: user.id,
          role: 'owner',
          communityId: community.id,
        }),
        {
          transaction,
        },
      );

      await transaction.commit();
      return this.sendResponseBody({
        message: 'successfully created',
        code: 201,
        data: {
          community,
          refreshedToken: token.accessToken !== discordAccount.accessToken,
          token:
            token.accessToken !== discordAccount.accessToken
              ? jwt.createToken({
                  id: user.id,
                  isVerified: user.isVerified,
                  isAdmin: false,
                  discordData: token,
                })
              : null,
        },
      });
    } catch (err) {
      await transaction.rollback();
      if (communityPayload.imageId)
        this.imagekitService.bulkDelete([communityPayload.imageId]);
      throw err;
    }
  }

  @Delete(':id')
  @HttpCode(200)
  public async deleteCommunity(
    @UserMe('id') userId: string,
    @CommunityContext('community') community: CommunityAttributes,
  ) {
    if (!community) throw new NotFoundException('community not found');

    if (community.owner !== userId)
      throw new ForbiddenException('only owner can delete community');

    const transaction = await this.sequelize.transaction();
    try {
      if (community.imageId)
        await this.imagekitService.bulkDelete([community.imageId]);

      await this.communityMemberService.deleteAllCommunityMember(community.id, {
        transaction,
      });
      await this.communityService.deleteOne(community.id, { transaction });

      await transaction.commit();
      return this.sendResponseBody({
        message: 'successfully deleted',
        code: 200,
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  @Get()
  @UsePipes(PaginationPipe)
  @HttpCode(200)
  @UseGuards(
    new RateLimitGuard({
      windowMs: 1 * 60 * 1000,
      max: 100,
      message: 'Too many requests from this IP, please try again in 1 minute.',
    }),
  )
  public async findAll(@Query() query: any) {
    const { page, limit } =
      await this.communityValidation.validatePaginationQuery(query);

    const { rows, count } = await this.communityService.findAndCountAll({
      page,
      limit,
    });

    return this.sendResponseBody(
      {
        message: 'OK',
        code: 200,
        data: rows,
      },
      {
        totalData: count,
        totalPage: Math.ceil(count / limit),
        page,
        limit,
      },
    );
  }
}
