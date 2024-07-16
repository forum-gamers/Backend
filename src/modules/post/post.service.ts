import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Post, type PostAttributes } from 'src/models/post';
import { CreatePostDto } from './dto/create.dto';
import {
  type DestroyOptions,
  type CreateOptions,
  type UpdateOptions,
} from 'sequelize';

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

  public async editText(
    id: number,
    text: string | null,
    opts?: UpdateOptions<PostAttributes>,
  ) {
    return await this.postModel.update(
      { text, editedText: true },
      { ...opts, where: { id } },
    );
  }

  public async updateTotalLike(
    id: number,
    totalLike: number,
    opts?: Partial<UpdateOptions<PostAttributes>>,
  ) {
    return await this.postModel.update(
      { totalLike },
      { ...opts, where: { id } },
    );
  }
}
