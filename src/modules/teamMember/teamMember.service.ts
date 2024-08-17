import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TeamMember, type TeamMemberAttributes } from 'src/models/teammember';
import { CreateTeamMemberDto } from './dto/create.dto';
import {
  type DestroyOptions,
  type CreateOptions,
  type FindOptions,
  type UpdateOptions,
} from 'sequelize';

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

  public async deleteByTeamId(
    teamId: string,
    opts?: Omit<DestroyOptions<TeamMemberAttributes>, 'where'>,
  ) {
    return await this.teamMemberModel.destroy({ ...opts, where: { teamId } });
  }

  public async findByTeamIdAndUserId(
    teamId: string,
    userId: string,
    opts?: Omit<FindOptions<TeamMemberAttributes>, 'where'>,
  ) {
    return await this.teamMemberModel.findOne({
      ...opts,
      where: { teamId, userId },
    });
  }

  public async verifiedMember(
    userId: string,
    opts?: Omit<UpdateOptions<TeamMemberAttributes>, 'where'>,
  ) {
    return await this.teamMemberModel.update(
      { status: true },
      { ...opts, where: { userId } },
    );
  }
}
