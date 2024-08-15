import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Team } from 'src/models/team';

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(Team)
    private readonly teamModel: typeof Team,
  ) {}
}
