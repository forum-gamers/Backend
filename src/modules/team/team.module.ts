import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Team } from 'src/models/team';
import { TeamService } from './team.service';

@Module({
  imports: [SequelizeModule.forFeature([Team])],
  providers: [TeamService],
  exports: [],
})
export class TeamModule {}
