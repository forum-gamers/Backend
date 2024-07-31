import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { BaseController } from 'src/base/controller.base';
import { ReplyService } from './reply.service';
import { Sequelize } from 'sequelize-typescript';
import { UserMe } from '../user/decorators/me.decorator';
import { CommentService } from '../comment/comment.service';
import { ReplyValidation } from './reply.validation';
import { Transaction } from 'sequelize';
import { CreateReplyDto } from './dto/create.dto';
import { PostService } from '../post/post.service';
import { UserPreferenceService } from '../userPreference/userPreference.service';
import { CreateUserPreferenceDto } from '../userPreference/dto/create.dto';
import { type UserAttributes } from 'src/models/user';

@Controller('reply')
export class ReplyController extends BaseController {
  constructor(
    private readonly replyService: ReplyService,
    private readonly sequelize: Sequelize,
    private readonly commentService: CommentService,
    private readonly replyValidation: ReplyValidation,
    private readonly postService: PostService,
    private readonly userPreferenceService: UserPreferenceService,
  ) {
    super();
  }

  @Post(':commentId')
  @HttpCode(201)
  public async create(
    @Body() payload: any,
    @Param('commentId', ParseIntPipe) commentId: number,
    @UserMe() user: UserAttributes,
  ) {
    const { text } = await this.replyValidation.validateCreateReply(payload);

    const comment = await this.commentService.findByIdAndPreloadPostId(
      commentId,
      { lock: Transaction.LOCK.UPDATE },
    );
    if (!comment) throw new NotFoundException('comment not found');
    if (!comment?.post) throw new NotFoundException('post not found');

    if ((await this.replyService.countByCommentId(comment.id)) >= 150)
      throw new ConflictException('reply limit reached');

    if (!comment.post.allowComment)
      throw new ConflictException('post is not allow comment');

    const transaction = await this.sequelize.transaction();
    try {
      const tasks: any[] = [
        this.replyService.create(
          new CreateReplyDto({
            commentId: comment.id,
            userId: user.id,
            text,
            postId: comment.post.id,
          }),
          { transaction },
        ),
        this.postService.updateTotalComment(
          comment.post.id,
          +comment.post.countComment + 1,
          { transaction },
        ),
      ];
      if (comment.post.text)
        tasks.push(
          this.userPreferenceService.create(
            new CreateUserPreferenceDto({
              userId: user.id,
              text: comment.post.text,
            }),
            { transaction },
          ),
        );
      const [data] = await Promise.all(tasks);

      await this.postService.updateTotalComment(
        comment.post.id,
        +comment.post.countComment + 1,
        { transaction },
      );

      await transaction.commit();
      return this.sendResponseBody({
        data: {
          ...data.dataValues,
          username: user.username,
          imageUrl: user.imageUrl,
          bio: user.bio,
        },
        message: 'reply created successfully',
        code: 201,
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}
