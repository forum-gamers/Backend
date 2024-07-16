import {
  BadGatewayException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
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
import { PostFindByIdPipe } from './pipes/findById.pipe';
import { type PostAttributes } from 'src/models/post';
import { RateLimitGuard } from 'src/middlewares/global/rateLimit.middleware';
import { BookmarkService } from '../bookmark/bookmark.service';
import { LikeService } from '../like/like.service';
import { CommentService } from '../comment/comment.service';
import { ReplyService } from '../reply/reply.service';

@Controller('post')
export class PostController extends BaseController {
  constructor(
    private readonly postService: PostService,
    private readonly postValidation: PostValidation,
    private readonly imagekitService: ImageKitService,
    private readonly sequelize: Sequelize,
    private readonly postMediaService: PostMediaService,
    private readonly bookmarkService: BookmarkService,
    private readonly likeService: LikeService,
    private readonly commentService: CommentService,
    private readonly replyService: ReplyService,
  ) {
    super();
  }

  @Post()
  @HttpCode(201)
  @UseGuards(
    new RateLimitGuard({
      windowMs: 5 * 60 * 1000,
      max: 50,
      message: 'Too many requests from this IP, please try again in 5 minutes.',
    }),
  )
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

  @Delete(':id')
  @HttpCode(200)
  public async deletePost(
    @UserMe('id') id: string,
    @Param('id', PostFindByIdPipe) post: PostAttributes | null,
  ) {
    if (!post) throw new NotFoundException('post not found');
    if (post.userId !== id) throw new ForbiddenException('forbidden access');

    const transaction = await this.sequelize.transaction();
    try {
      const medias = await this.postMediaService.findByPostId(post.id);
      if (medias.length)
        await this.imagekitService.bulkDelete(medias.map((el) => el.fileId));

      await Promise.all([
        this.postMediaService.deleteByPostId(post.id, { transaction }),
        this.bookmarkService.deleteAllByPostId(post.id, { transaction }),
        this.commentService.deleteAllByPostId(post.id, { transaction }),
        this.likeService.deleteAllByPostId(post.id, { transaction }),
        this.replyService.deleteAllByPostId(post.id, { transaction }),
      ]);
      await this.postService.deleteOne(post.id, { transaction });

      await transaction.commit();
      return this.sendResponseBody({
        message: 'post deleted successfully',
        code: 200,
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  @Patch(':id')
  @HttpCode(200)
  public async editText(
    @Param('id', PostFindByIdPipe) post: PostAttributes | null,
    @UserMe('id') userId: string,
    @Body() payload: any,
  ) {
    if (!post) throw new NotFoundException('post not found');
    if (post.userId !== userId)
      throw new ForbiddenException('forbidden access');

    const { text } = await this.postValidation.validateEditText(
      payload,
      post.text,
    );

    if (!!text && text !== post.text)
      await this.postService.editText(post.id, text);

    return this.sendResponseBody({
      message: 'OK',
      code: 200,
    });
  }
}
