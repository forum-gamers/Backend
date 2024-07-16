import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  PostBookmark,
  type PostBookmarkAttributes,
} from 'src/models/postbookmark';
import { CreateBookmarkDto } from './dto/create.dto';
import { type DestroyOptions, type CreateOptions } from 'sequelize';
import { QueryParamsDto } from 'src/utils/dto/pagination.dto';
import { Post } from 'src/models/post';

@Injectable()
export class BookmarkService {
  constructor(
    @InjectModel(PostBookmark)
    private readonly bookmarkModel: typeof PostBookmark,
  ) {}

  public async create(
    payload: CreateBookmarkDto,
    opts?: CreateOptions<PostBookmarkAttributes>,
  ) {
    return await this.bookmarkModel.create(payload, opts);
  }

  public async findOneByPostIdAndUserId(postId: number, userId: string) {
    return await this.bookmarkModel.findOne({ where: { postId, userId } });
  }

  public async deleteByPostIdAndUserId(
    postId: number,
    userId: string,
    opts?: DestroyOptions<PostBookmarkAttributes>,
  ) {
    return await this.bookmarkModel.destroy({
      ...opts,
      where: { postId, userId },
    });
  }

  public async getBookmarkByUserId(
    userId: string,
    {
      page = 1,
      limit = 10,
      sortDirection = 'desc',
      sortby = 'createdAt',
    }: QueryParamsDto,
  ) {
    return await this.bookmarkModel.findAndCountAll({
      where: { userId },
      limit,
      offset: (page - 1) * limit,
      order: [[sortby, sortDirection]],
      include: [{ model: Post }],
    });
  }

  public async deleteAllByPostId(
    postId: number,
    opts?: DestroyOptions<PostBookmarkAttributes>,
  ) {
    return await this.bookmarkModel.destroy({ ...opts, where: { postId } });
  }
}
