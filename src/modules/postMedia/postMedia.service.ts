import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PostMedia, type PostMediaAttributes } from 'src/models/postMedia';
import { CreatePostMediaDto } from './dto/create.dto';
import { type CreateOptions } from 'sequelize';

@Injectable()
export class PostMediaService {
  constructor(
    @InjectModel(PostMedia)
    private readonly postMediaModel: typeof PostMedia,
  ) {}

  public async create(
    payload: CreatePostMediaDto,
    opts?: CreateOptions<PostMediaAttributes>,
  ) {
    return await this.postMediaModel.create(payload, opts);
  }
}
