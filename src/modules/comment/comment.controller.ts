import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BaseController } from 'src/base/controller.base';
import { CommentService } from './comment.service';
import { CommentValidation } from './comment.validation';
import { UserMe } from '../user/decorators/me.decorator';
import { PostFindByIdPipe } from '../post/pipes/findById.pipe';
import { type PostAttributes } from 'src/models/post';
import { CreateCommentDto } from './dto/create.dto';
import { RateLimitGuard } from 'src/middlewares/global/rateLimit.middleware';
import { CommentFindByIdPipe } from './pipes/commentFindById.pipe';
import { type PostCommentAttributes } from 'src/models/postcomment';
import { Sequelize } from 'sequelize-typescript';
import { ReplyService } from '../reply/reply.service';
import { QueryParamsDto } from 'src/utils/dto/pagination.dto';

@Controller('comment')
export class CommentController extends BaseController {
  constructor(
    private readonly commentService: CommentService,
    private readonly commentValidation: CommentValidation,
    private readonly sequelize: Sequelize,
    private readonly replyService: ReplyService,
  ) {
    super();
  }

  @Post(':id')
  @UseGuards(
    new RateLimitGuard({
      windowMs: 1 * 60 * 1000,
      max: 10,
      message: 'Too many requests from this IP, please try again in 1 minute.',
    }),
  )
  @HttpCode(201)
  public async create(
    @UserMe('id') userId: string,
    @Param('id', PostFindByIdPipe) post: PostAttributes | null,
    @Body() payload: any,
  ) {
    if (!post) throw new NotFoundException('post not found');

    if (!post.allowComment)
      throw new BadRequestException('post not allow comment');

    const { text } =
      await this.commentValidation.validateCreateComment(payload);

    return this.sendResponseBody({
      message: 'comment created',
      code: 201,
      data: await this.commentService.create(
        new CreateCommentDto({ userId, text, postId: post.id }),
      ),
    });
  }

  @Delete(':id')
  @HttpCode(200)
  public async delete(
    @UserMe('id') userId: string,
    @Param('id', CommentFindByIdPipe) comment: PostCommentAttributes | null,
  ) {
    if (!comment) throw new NotFoundException('comment not found');
    if (comment.userId !== userId)
      throw new ForbiddenException(
        'you are not allowed to delete this comment',
      );

    const transaction = await this.sequelize.transaction();
    try {
      await this.replyService.deleteAllByCommentId(comment.id, {
        transaction,
      });
      await this.commentService.deleteAllByPostId(comment.postId, {
        transaction,
      });

      await transaction.commit();
      return this.sendResponseBody({
        message: 'comment deleted successfully',
        code: 200,
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  @Get(':id')
  @HttpCode(200)
  public async getPostComment(
    @Param('id', ParseIntPipe) id: number,
    @Query()
    {
      page = 1,
      limit = 10,
      sortDirection = 'desc',
      sortby = 'createdAt',
    }: QueryParamsDto,
  ) {
    if (isNaN(id)) throw new BadRequestException('postId must be a number');

    const { rows, count } = await this.commentService.getPostComment(id, {
      page,
      limit,
      sortDirection,
      sortby,
    });

    return this.sendResponseBody(
      {
        message: 'comments fetched successfully',
        code: 200,
        data: rows,
      },
      {
        page,
        limit,
        totalData: count,
        totalPage: Math.ceil(count / limit),
      },
    );
  }
}
