import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Follow, type FollowAttributes } from 'src/models/follow';
import { CreateFollowDto } from './dto/create.dto';
import { DestroyOptions, type CreateOptions } from 'sequelize';
import { User } from 'src/models/user';
import { QueryParamsDto } from 'src/utils/dto/pagination.dto';

@Injectable()
export class FollowService {
  constructor(
    @InjectModel(Follow)
    private readonly followModel: typeof Follow,
  ) {}

  public async findOne(followerId: string, followedId: string) {
    return await this.followModel.findOne({
      where: { followerId, followedId },
    });
  }

  public async create(
    payload: CreateFollowDto,
    opts?: CreateOptions<FollowAttributes>,
  ) {
    return await this.followModel.create(payload, opts);
  }

  public async deleteOne(
    { followerId, followedId }: CreateFollowDto,
    opts?: DestroyOptions<FollowAttributes>,
  ) {
    return await this.followModel.destroy({
      ...opts,
      where: { followerId, followedId },
    });
  }

  public async getFollowers(
    followedId: string,
    {
      page = 1,
      limit = 15,
      sortDirection = 'DESC',
      sortby = 'createdAt',
    }: QueryParamsDto,
  ) {
    return await this.followModel.findAll({
      where: { followedId },
      include: [
        {
          model: User,
          as: 'follower',
          attributes: ['id', 'username', 'email', 'imageUrl'],
        },
      ],
      offset: (page - 1) * limit,
      order: [[sortby, sortDirection]],
    });
  }

  public async getMyFollowings(
    followerId: string,
    {
      page = 1,
      limit = 15,
      sortDirection = 'DESC',
      sortby = 'createdAt',
    }: QueryParamsDto,
  ) {
    return await this.followModel.findAll({
      where: { followerId },
      include: [
        {
          model: User,
          as: 'followed',
          attributes: ['id', 'username', 'email', 'imageUrl'],
        },
      ],
      offset: (page - 1) * limit,
      order: [[sortby, sortDirection]],
    });
  }
}
