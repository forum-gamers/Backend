import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Community, type CommunityAttributes } from 'src/models/community';
import { CreateCommunityDto } from './dto/create.dto';
import { DestroyOptions, type CreateOptions } from 'sequelize';

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

  public async findById(id: number) {
    return await this.communityModel.findByPk(id);
  }

  public async deleteOne(
    id: number,
    opts?: DestroyOptions<CommunityAttributes>,
  ) {
    return await this.communityModel.destroy({ ...opts, where: { id } });
  }
}
