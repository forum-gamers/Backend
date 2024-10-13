import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TournamentParticipant } from 'src/models/tournamentparticipant';
import { TournamentParticipantService } from './tournamentParticipant.service';

@Module({
  imports: [SequelizeModule.forFeature([TournamentParticipant])],
  providers: [TournamentParticipantService],
  exports: [TournamentParticipantService],
})
export class TournamentParticipantModule {}
