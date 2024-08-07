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
import { LikeService } from './like.service';
import { UserMe } from '../user/decorators/me.decorator';
import { type PostAttributes } from 'src/models/post';
import { CreateLikeDto } from './dto/create.dto';
import { PostService } from '../post/post.service';
import { Sequelize } from 'sequelize-typescript';
import { PostLockedFindByIdPipe } from '../post/pipes/findById.locked.pipe';
import { UserPreferenceService } from '../userPreference/userPreference.service';
import { CreateUserPreferenceDto } from '../userPreference/dto/create.dto';

@Controller('like')
export class LikeController extends BaseController {
  constructor(
    private readonly likeService: LikeService,
    private readonly postService: PostService,
    private readonly sequelize: Sequelize,
    private readonly userPreferenceService: UserPreferenceService,
  ) {
    super();
  }

  @Post(':id')
  @HttpCode(201)
  public async likeAPost(
    @UserMe('id') userId: string,
    @Param('id', PostLockedFindByIdPipe) post: PostAttributes | null,
  ) {
    if (!post || post.isBlocked) throw new NotFoundException('post not found');

    if (await this.likeService.findOneByPostIdAndUserId(post.id, userId))
      throw new ConflictException('post already liked');

    const transaction = await this.sequelize.transaction();
    try {
      const tasks: any[] = [
        this.likeService.create(
          new CreateLikeDto({ postId: post.id, userId }),
          { transaction },
        ),
        this.postService.updateTotalLike(post.id, +post.totalLike + 1, {
          transaction,
        }),
      ];
      if (post.text)
        tasks.push(
          this.userPreferenceService.create(
            new CreateUserPreferenceDto({ userId, text: post.text }),
            { transaction },
          ),
        );

      await Promise.all(tasks);

      await transaction.commit();
      return this.sendResponseBody({
        message: 'post liked',
        code: 201,
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  @Delete(':id')
  @HttpCode(200)
  public async unlikeAPost(
    @UserMe('id') userId: string,
    @Param('id', PostLockedFindByIdPipe) post: PostAttributes | null,
  ) {
    if (!post || post.isBlocked) throw new NotFoundException('post not found');

    if (!(await this.likeService.findOneByPostIdAndUserId(post.id, userId)))
      throw new NotFoundException('post not liked');

    const transaction = await this.sequelize.transaction();
    try {
      await Promise.all([
        this.likeService.deleteByPostIdAndUserId(post.id, userId, {
          transaction,
        }),
        this.postService.updateTotalLike(post.id, +post.totalLike - 1, {
          transaction,
        }),
      ]);

      await transaction.commit();
      return this.sendResponseBody({ message: 'OK', code: 200 });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}
