import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PostLike, type PostLikeAttributes } from 'src/models/postlike';
import { CreateLikeDto } from './dto/create.dto';
import { DestroyOptions, type CreateOptions } from 'sequelize';

@Injectable()
export class LikeService {
  constructor(
    @InjectModel(PostLike)
    private readonly postLikeModel: typeof PostLike,
  ) {}

  public async findOneByPostIdAndUserId(postId: number, userId: string) {
    return await this.postLikeModel.findOne({ where: { postId, userId } });
  }

  public async create(
    payload: CreateLikeDto,
    opts?: CreateOptions<PostLikeAttributes>,
  ) {
    return await this.postLikeModel.create(payload, opts);
  }

  public async deleteByPostIdAndUserId(
    postId: number,
    userId: string,
    opts?: DestroyOptions<PostLikeAttributes>,
  ) {
    return await this.postLikeModel.destroy({
      ...opts,
      where: { postId, userId },
    });
  }
}
