import {
  ConflictException,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { BaseController } from 'src/base/controller.base';
import { BookmarkService } from './bookmark.service';
import { UserMe } from '../user/decorators/me.decorator';
import { type PostAttributes } from 'src/models/post';
import { CreateBookmarkDto } from './dto/create.dto';
import { PostService } from '../post/post.service';
import { Sequelize } from 'sequelize-typescript';
import { PostLockedFindByIdPipe } from '../post/pipes/findById.locked.pipe';

@Controller('bookmark')
export class BookmarkController extends BaseController {
  constructor(
    private readonly bookmarkService: BookmarkService,
    private readonly postService: PostService,
    private readonly sequelize: Sequelize,
  ) {
    super();
  }

  @Post(':id')
  @HttpCode(201)
  public async bookmarkAPost(
    @UserMe('id') userId: string,
    @Param('id', PostLockedFindByIdPipe) post: PostAttributes | null,
  ) {
    if (!post || post.isBlocked) throw new NotFoundException('post not found');

    if (await this.bookmarkService.findOneByPostIdAndUserId(post.id, userId))
      throw new ConflictException('post already bookmarked');

    const transaction = await this.sequelize.transaction();
    try {
      await Promise.all([
        this.bookmarkService.create(
          new CreateBookmarkDto({ postId: post.id, userId }),
        ),
        this.postService.updateTotalBookmark(post.id, +post.countBookmark + 1, {
          transaction,
        }),
      ]);

      await transaction.commit();
      return this.sendResponseBody({
        message: 'post bookmarked',
        code: 201,
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  @Delete(':id')
  @HttpCode(200)
  public async unbookmarkAPost(
    @UserMe('id') userId: string,
    @Param('id', PostLockedFindByIdPipe) post: PostAttributes | null,
  ) {
    if (!post || post.isBlocked) throw new NotFoundException('post not found');

    if (!(await this.bookmarkService.findOneByPostIdAndUserId(post.id, userId)))
      throw new NotFoundException('bookmark not found');

    const transaction = await this.sequelize.transaction();
    try {
      await Promise.all([
        this.bookmarkService.deleteByPostIdAndUserId(post.id, userId, {
          transaction,
        }),
        this.postService.updateTotalBookmark(post.id, +post.countBookmark - 1, {
          transaction,
        }),
      ]);

      await transaction.commit();
      return this.sendResponseBody({
        message: 'post unbookmarked',
        code: 200,
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}
