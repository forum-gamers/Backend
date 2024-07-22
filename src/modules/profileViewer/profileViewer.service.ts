import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  type ProfileViewerAttributes,
  ProfileViewers,
} from 'src/models/profileviewer';
import { CreateProfileViewerDto } from './dto/create.dto';
import { Op, type CreateOptions } from 'sequelize';

@Injectable()
export class ProfileViewerService {
  constructor(
    @InjectModel(ProfileViewers)
    private readonly profileViewersModel: typeof ProfileViewers,
  ) {}

  public async create(
    payload: CreateProfileViewerDto,
    opts?: CreateOptions<ProfileViewerAttributes>,
  ) {
    return await this.profileViewersModel.create(payload, opts);
  }

  public async findOneByIdIntervalThreeDays(
    targetId: string,
    viewerId: string,
  ) {
    return await this.profileViewersModel.findOne({
      where: {
        targetId,
        viewerId,
        createdAt: {
          [Op.gte]: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
      },
    });
  }
}
