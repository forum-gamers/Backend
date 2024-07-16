import {
  BadGatewayException,
  Body,
  Controller,
  HttpCode,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { BaseController } from 'src/base/controller.base';
import { PostService } from './post.service';
import { PostValidation } from './post.validation';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImageKitService } from 'src/third-party/imagekit/imagekit.service';
import { SUPPORTED_VIDEO_TYPE } from 'src/constants/global.constant';
import { POST_IMAGE_FOLDER, POST_VIDEO_FOLDER } from './post.constant';
import { CreatePostMediaDto } from '../postMedia/dto/create.dto';
import { Sequelize } from 'sequelize-typescript';
import { CreatePostDto } from './dto/create.dto';
import { UserMe } from '../user/decorators/me.decorator';
import { PostMediaService } from '../postMedia/postMedia.service';
import { PostMedia } from 'src/models/postMedia';

@Controller('post')
export class PostController extends BaseController {
  constructor(
    private readonly postService: PostService,
    private readonly postValidation: PostValidation,
    private readonly imagekitService: ImageKitService,
    private readonly sequelize: Sequelize,
    private readonly postMediaService: PostMediaService,
  ) {
    super();
  }

  @Post()
  @HttpCode(201)
  @UseInterceptors(
    FilesInterceptor('files', 4, {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  public async create(
    @Body() payload: any,
    @UploadedFiles() rawFiles: Express.Multer.File[] = [],
    @UserMe('id') userId: string,
  ) {
    const { text, allowComment, communityId, privacy } =
      await this.postValidation.validateCreatePost(payload, !!rawFiles?.length);
    const postMedias: PostMedia[] = [];
    const transaction = await this.sequelize.transaction();
    try {
      const post = await this.postService.create(
        new CreatePostDto({
          allowComment,
          communityId,
          privacy,
          userId,
          text,
        }),
        {
          transaction,
        },
      );

      if (rawFiles.length) {
        const { files } = await this.postValidation.validatePostUploadFiles({
          files: rawFiles,
        });
        const uploadedFiles = await this.imagekitService.multipleUpload(
          files.map(({ originalname, buffer, mimetype }) => ({
            useUniqueFileName: true,
            fileName: originalname,
            file: buffer,
            folder: SUPPORTED_VIDEO_TYPE.includes(mimetype)
              ? POST_VIDEO_FOLDER
              : POST_IMAGE_FOLDER,
          })),
        );

        if (!uploadedFiles.length)
          throw new BadGatewayException('failed to upload files');

        postMedias.push(
          ...(await Promise.all(
            uploadedFiles.map(
              async (el) =>
                await this.postMediaService.create(
                  new CreatePostMediaDto(el, post.id),
                  {
                    transaction,
                  },
                ),
            ),
          )),
        );
      }

      await transaction.commit();
      return this.sendResponseBody({
        message: 'post created',
        code: 201,
        data: {
          ...post.dataValues,
          media: postMedias,
        },
      });
    } catch (err) {
      if (postMedias.length)
        this.imagekitService.bulkDelete(postMedias.map((el) => el.fileId));
      await transaction.rollback();
      throw err;
    }
  }
}
