import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Post,
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

@Controller('community')
export class CommunityController extends BaseController {
  constructor(
    private readonly communityService: CommunityService,
    private readonly communityValidation: CommunityValidation,
    private readonly imagekitService: ImageKitService,
    private readonly sequelize: Sequelize,
    private readonly communityMemberService: CommunityMemberService,
  ) {
    super();
  }

  @Post()
  @HttpCode(201)
  @UseGuards(
    new RateLimitGuard({
      windowMs: 1 * 60 * 1000,
      max: 5,
      message: 'Too many requests from this IP, please try again in 1 minute.',
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
}
