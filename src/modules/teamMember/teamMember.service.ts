import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TeamMember, type TeamMemberAttributes } from 'src/models/teammember';
import { CreateTeamMemberDto } from './dto/create.dto';
import { type CreateOptions } from 'sequelize';

@Injectable()
export class TeamMemberService {
  constructor(
    @InjectModel(TeamMember)
    private readonly teamMemberModel: typeof TeamMember,
  ) {}

  public async create(
    payload: CreateTeamMemberDto,
    opts?: CreateOptions<TeamMemberAttributes>,
  ) {
    return await this.teamMemberModel.create(payload, opts);
  }
}