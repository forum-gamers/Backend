import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Team, type TeamAttributes } from 'src/models/team';
import { CreateTeamDto } from './dto/create.dto';
import { type CreateOptions } from 'sequelize';

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
}
