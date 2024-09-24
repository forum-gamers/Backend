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
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
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
import { DiscordService } from '../discord/discord.service';
import { DiscordMeService } from 'src/third-party/discord/me.service';
import globalUtils from 'src/utils/global/global.utils';
import type { DiscordGuild } from 'src/third-party/discord/discord.interface';
import { RequiredField } from 'src/utils/pipes/requiredField.pipe';
import { DiscordOauthService } from 'src/third-party/discord/oauth.service';
import jwt, { type TokenDiscordData } from 'src/utils/global/jwt.utils';
import { type UserAttributes } from 'src/models/user';
import * as yup from 'yup';
import { QueryPipe } from 'src/utils/pipes/query.pipe';
import type { BaseQuery } from 'src/interfaces/request.interface';
import { type CommunityMembersAttributes } from 'src/models/communitymember';
import { FileValidationPipe } from 'src/utils/pipes/file.pipe';
import { SUPPORTED_IMAGE_TYPE } from 'src/constants/global.constant';
import { UpdateCommunityDto } from './dto/update.dto';

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
      lastUpdated: discordAccount.updatedAt.getTime(),
    };

    if (
      globalUtils.isExpires(
        Number(discordAccount.tokenExpires),
        Math.floor(token.lastUpdated / 1000),
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
        lastUpdated: Date.now(),
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
  @HttpCode(200)
  @UseGuards(
    new RateLimitGuard({
      windowMs: 1 * 60 * 1000,
      max: 100,
      message: 'Too many requests from this IP, please try again in 1 minute.',
    }),
  )
  public async findAll(
    @Query(
      new QueryPipe(1, 10, {
        q: yup.string().optional(),
      }),
    )
    { page, limit, q = null }: BaseQuery & { q?: string },
    @UserMe('id') userId: string,
  ) {
    const { datas, totalData } = await this.communityService.findAndCountAll({
      page,
      limit,
      userId,
      q,
    });

    return this.sendResponseBody(
      {
        message: 'OK',
        code: 200,
        data: datas,
      },
      {
        totalData,
        totalPage: Math.ceil(totalData / limit),
        page,
        limit,
      },
    );
  }

  @Get(':id')
  @HttpCode(200)
  public async findById(
    @Param('id', ParseIntPipe) id: number,
    @UserMe('id') userId: string,
  ) {
    const community = await this.communityService.findDetailById(id, userId);
    if (!community) throw new NotFoundException('community not found');

    return this.sendResponseBody({
      message: 'OK',
      code: 200,
      data: community,
    });
  }

  @Put(':id')
  @HttpCode(200)
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
  public async updateCommunity(
    @CommunityContext()
    {
      community,
      communityMember,
    }: {
      community: CommunityAttributes;
      communityMember: CommunityMembersAttributes;
    },
    @Body() payload: any,
    @UploadedFile(
      new FileValidationPipe({
        mimetype: yup
          .string()
          .oneOf([...SUPPORTED_IMAGE_TYPE], 'unsupported file')
          .required('mimetype is required'),
        size: yup
          .number()
          .max(2 * 1024 * 1024, 'max size 2mb')
          .required('size is required'),
      }),
    )
    rawFile: Express.Multer.File | null,
  ) {
    if (!community) throw new NotFoundException('community not found');
    if (!communityMember?.role || communityMember?.role === 'member')
      throw new ForbiddenException('cannot update community');

    const { name, description } =
      await this.communityValidation.validateUpdateCommunity(payload, {
        name: community.name,
        description: community.description,
      });

    if (
      community.name !== name &&
      (await this.communityService.findOneByName(name))
    )
      throw new ConflictException('name already exist');

    const transaction = await this.sequelize.transaction();
    const payloadData = new UpdateCommunityDto({
      name,
      description,
      imageUrl: community.imageUrl,
      imageId: community.imageId,
    });
    let uploadedImage: string | null = null;
    try {
      if (rawFile) {
        const {
          file: { buffer, originalname },
        } = await this.communityValidation.validateCreateCommunityImage({
          file: rawFile,
        });
        const upload = await this.imagekitService.uploadFile({
          file: buffer,
          fileName: originalname,
          folder: COMMUNITY_IMAGE_FOLDER,
          useUniqueFileName: true,
        });
        if (!upload) throw new BadGatewayException('failed to upload file');

        uploadedImage = upload.fileId;
        payloadData.updateImage(upload.url, upload.fileId);
      }

      const result =
        (
          (await this.communityService.updateData(community.id, payloadData, {
            returning: [
              'id',
              'name',
              'description',
              'imageUrl',
              'imageId',
              'owner',
              'isDiscordServer',
              'createdAt',
              'updatedAt',
            ],
            transaction,
          })) as any
        )?.[1]?.[0] ?? null;

      await transaction.commit();
      this.imagekitService.bulkDelete([community.imageId]);
      return this.sendResponseBody({
        message: 'successfully updated',
        code: 200,
        data: result,
      });
    } catch (err) {
      await transaction.rollback();
      if (uploadedImage && uploadedImage !== community.imageId)
        this.imagekitService.bulkDelete([uploadedImage]);
      throw err;
    }
  }
}
