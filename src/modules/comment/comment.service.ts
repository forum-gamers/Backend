import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  PostComment,
  type PostCommentAttributes,
} from 'src/models/postcomment';
import { CreateCommentDto } from './dto/create.dto';
import { type CreateOptions } from 'sequelize';

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
}
