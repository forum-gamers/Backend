import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Post, type PostAttributes } from 'src/models/post';
import { CreatePostDto } from './dto/create.dto';
import { type DestroyOptions, type CreateOptions } from 'sequelize';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post)
    private readonly postModel: typeof Post,
  ) {}

  public async create(
    payload: CreatePostDto,
    opts?: CreateOptions<PostAttributes>,
  ) {
    return await this.postModel.create(payload, opts);
  }

  public async findById(id: number) {
    return await this.postModel.findByPk(id);
  }

  public async deleteOne(id: number, opts?: DestroyOptions<PostAttributes>) {
    return await this.postModel.destroy({ ...opts, where: { id } });
  }
}
