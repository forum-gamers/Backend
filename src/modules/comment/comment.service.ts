import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  PostComment,
  type PostCommentAttributes,
} from 'src/models/postcomment';
import { CreateCommentDto } from './dto/create.dto';
import { type UpdateOptions, type CreateOptions } from 'sequelize';
import { QueryParamsDto } from 'src/utils/dto/pagination.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(PostComment)
    private readonly commentModel: typeof PostComment,
  ) {}

  public async create(
    payload: CreateCommentDto,
    opts?: CreateOptions<PostCommentAttributes>,
  ) {
    return await this.commentModel.create(payload, opts);
  }

  public async deleteAllByPostId(
    postId: number,
    opts?: Partial<UpdateOptions<PostCommentAttributes>>,
  ) {
    return await this.commentModel.destroy({ ...opts, where: { postId } });
  }

  public async findAllByPostId(postId: number) {
    return await this.commentModel.findAll({ where: { postId } });
  }

  public async findById(id: number) {
    return await this.commentModel.findByPk(id);
  }

  public async getPostComment(
    postId: number,
    {
      page = 1,
      limit = 10,
      sortDirection = 'DESC',
      sortby = 'createdAt',
    }: QueryParamsDto,
  ) {
    return await this.commentModel.findAndCountAll({
      where: { postId },
      limit,
      offset: (page - 1) * limit,
      order: [[sortby, sortDirection]],
    });
  }
}
