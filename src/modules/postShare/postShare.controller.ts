import {
  ConflictException,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { PostShareService } from './postShare.service';
import { Sequelize } from 'sequelize-typescript';
import { PostService } from '../post/post.service';
import { UserMe } from '../user/decorators/me.decorator';
import { PostLockedFindByIdPipe } from '../post/pipes/findById.locked.pipe';
import { PostAttributes } from 'src/models/post';
import { CreateShareDto } from './dto/create.dto';
import { BaseController } from 'src/base/controller.base';

@Controller('share')
export class PostShareController extends BaseController {
  constructor(
    private readonly postShareService: PostShareService,
    private readonly sequelize: Sequelize,
    private readonly postService: PostService,
  ) {
    super();
  }

  @Post(':id')
  @HttpCode(201)
  public async shareAPost(
    @UserMe('id') userId: string,
    @Param('id', PostLockedFindByIdPipe) post: PostAttributes | null,
  ) {
    if (!post) throw new NotFoundException('post not found');

    if (await this.postShareService.findOneByPostIdAndUserId(post.id, userId))
      throw new ConflictException('post already shared');

    const transaction = await this.sequelize.transaction();
    try {
      await Promise.all([
        this.postShareService.create(
          new CreateShareDto({ postId: post.id, userId }),
          { transaction },
        ),
        this.postService.updateTotalShared(post.id, +post.countShare + 1, {
          transaction,
        }),
      ]);

      await transaction.commit();
      return this.sendResponseBody({
        message: 'post shared',
        code: 201,
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  @Delete(':id')
  @HttpCode(200)
  public async unshareAPost(
    @UserMe('id') userId: string,
    @Param('id', PostLockedFindByIdPipe) post: PostAttributes | null,
  ) {
    if (!post) throw new NotFoundException('post not found');

    if (
      !(await this.postShareService.findOneByPostIdAndUserId(post.id, userId))
    )
      throw new NotFoundException('post not liked');

    const transaction = await this.sequelize.transaction();
    try {
      await Promise.all([
        this.postShareService.deleteByPostIdAndUserId(post.id, userId, {
          transaction,
        }),
        this.postService.updateTotalShared(post.id, +post.countShare - 1, {
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
