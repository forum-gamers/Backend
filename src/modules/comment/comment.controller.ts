import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Post,
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

@Controller('comment')
export class CommentController extends BaseController {
  constructor(
    private readonly commentService: CommentService,
    private readonly commentValidation: CommentValidation,
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
}
