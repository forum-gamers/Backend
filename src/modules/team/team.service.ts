import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Team, type TeamAttributes } from 'src/models/team';
import { CreateTeamDto } from './dto/create.dto';
import {
  type FindOptions,
  type CreateOptions,
  type DestroyOptions,
  type UpdateOptions,
} from 'sequelize';

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(Team)
    private readonly teamModel: typeof Team,
  ) {}

  public async countByOwner(owner: string) {
    return await this.teamModel.count({ where: { owner } });
  }

  public async create(
    payload: CreateTeamDto,
    opts?: CreateOptions<TeamAttributes>,
  ) {
    return await this.teamModel.create(payload, opts);
  }

  public async findById(
    id: string,
    opts?: Omit<FindOptions<TeamAttributes>, 'where'>,
  ) {
    return await this.teamModel.findByPk(id, opts);
  }

  public async deleteById(
    id: string,
    opts?: Omit<DestroyOptions<TeamAttributes>, 'where'>,
  ) {
    return await this.teamModel.destroy({ ...opts, where: { id } });
  }

  public async updateTotalMember(
    id: string,
    totalMember: number,
    opts?: Omit<UpdateOptions<TeamAttributes>, 'where'>,
  ) {
    return await this.teamModel.update(
      { totalMember },
      { ...opts, where: { id } },
    );
  }
}
