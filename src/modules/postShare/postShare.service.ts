import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PostShare, type PostShareAttributes } from 'src/models/postshare';
import { CreateShareDto } from './dto/create.dto';
import { type DestroyOptions, type CreateOptions } from 'sequelize';

@Injectable()
export class PostShareService {
  constructor(
    @InjectModel(PostShare)
    private readonly postShareModel: typeof PostShare,
  ) {}

  public async create(
    payload: CreateShareDto,
    opts?: CreateOptions<PostShareAttributes>,
  ) {
    return await this.postShareModel.create(payload, opts);
  }

  public async findOneByPostIdAndUserId(postId: number, userId: string) {
    return await this.postShareModel.findOne({ where: { postId, userId } });
  }

  public async deleteByPostIdAndUserId(
    postId: number,
    userId: string,
    opts?: DestroyOptions<PostShareAttributes>,
  ) {
    return await this.postShareModel.destroy({
      ...opts,
      where: { postId, userId },
    });
  }
}
