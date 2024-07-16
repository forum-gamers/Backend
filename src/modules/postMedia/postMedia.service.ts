import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PostMedia, type PostMediaAttributes } from 'src/models/postMedia';
import { CreatePostMediaDto } from './dto/create.dto';
import { type DestroyOptions, type CreateOptions } from 'sequelize';

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

  public async deleteByPostId(
    postId: number,
    opts?: DestroyOptions<PostMediaAttributes>,
  ) {
    return await this.postMediaModel.destroy({ ...opts, where: { postId } });
  }

  public async findByPostId(postId: number) {
    return await this.postMediaModel.findAll({ where: { postId } });
  }
}
