import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TeamMember } from 'src/models/teammember';
import { TeamMemberService } from './teamMember.service';

@Module({
  imports: [SequelizeModule.forFeature([TeamMember])],
  providers: [TeamMemberService],
})
export class TeamMemberModule {}
