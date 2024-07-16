import {
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { BaseController } from 'src/base/controller.base';
import { BookmarkService } from './bookmark.service';
import { UserMe } from '../user/decorators/me.decorator';
import { PostFindByIdPipe } from '../post/pipes/findById.pipe';
import { type PostAttributes } from 'src/models/post';
import { CreateBookmarkDto } from './dto/create.dto';
import { QueryParamsDto } from 'src/utils/dto/pagination.dto';
import { PaginationPipe } from 'src/utils/pipes/pagination.pipe';

@Controller('bookmark')
export class BookmarkController extends BaseController {
  constructor(private readonly bookmarkService: BookmarkService) {
    super();
  }

  @Post(':id')
  @HttpCode(201)
  public async bookmarkAPost(
    @UserMe('id') userId: string,
    @Param('id', PostFindByIdPipe) post: PostAttributes | null,
  ) {
    if (!post) throw new NotFoundException('post not found');

    if (await this.bookmarkService.findOneByPostIdAndUserId(post.id, userId))
      throw new ConflictException('post already bookmarked');

    await this.bookmarkService.create(
      new CreateBookmarkDto({ postId: post.id, userId }),
    );

    return this.sendResponseBody({
      message: 'post bookmarked',
      code: 201,
    });
  }

  @Delete(':id')
  @HttpCode(200)
  public async unbookmarkAPost(
    @UserMe('id') userId: string,
    @Param('id', PostFindByIdPipe) post: PostAttributes | null,
  ) {
    if (!post) throw new NotFoundException('post not found');

    if (!(await this.bookmarkService.findOneByPostIdAndUserId(post.id, userId)))
      throw new NotFoundException('bookmark not found');

    await this.bookmarkService.deleteByPostIdAndUserId(post.id, userId);
    return this.sendResponseBody({
      message: 'post unbookmarked',
      code: 200,
    });
  }

  @Get('me')
  @HttpCode(200)
  @UsePipes(PaginationPipe)
  public async getMyBookmarks(
    @UserMe('id') userId: string,
    @Query()
    {
      page = 1,
      limit = 10,
      sortDirection = 'desc',
      sortby = 'createdAt',
    }: QueryParamsDto,
  ) {
    const { rows, count } = await this.bookmarkService.getBookmarkByUserId(
      userId,
      {
        page,
        limit,
        sortDirection,
        sortby,
      },
    );

    return this.sendResponseBody(
      {
        message: 'OK',
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
