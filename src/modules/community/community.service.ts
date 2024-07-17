import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Community, type CommunityAttributes } from 'src/models/community';
import { CreateCommunityDto } from './dto/create.dto';
import { type CreateOptions } from 'sequelize';

@Injectable()
export class CommunityService {
  constructor(
    @InjectModel(Community)
    private readonly communityModel: typeof Community,
  ) {}

  public async findOneByName(name: string) {
    return await this.communityModel.findOne({ where: { name } });
  }

  public async create(
    payload: CreateCommunityDto,
    opts?: CreateOptions<CommunityAttributes>,
  ) {
    return await this.communityModel.create(payload, opts);
  }
}
