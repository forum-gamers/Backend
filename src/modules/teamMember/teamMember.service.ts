import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TeamMember } from 'src/models/teammember';

@Injectable()
export class TeamMemberService {
  constructor(
    @InjectModel(TeamMember)
    private readonly teamMemberModel: typeof TeamMember,
  ) {}
}
