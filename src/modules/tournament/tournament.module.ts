import {
  forwardRef,
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Tournament } from 'src/models/tournament';
import { TournamentService } from './tournament.service';
import { USER_VERIFIED_MIDDLEWARE } from 'src/constants/global.constant';
import { TournamentController } from './tournament.controller';
import { GameModule } from '../game/game.module';
import { ThirdPartyModule } from 'src/third-party/third-party.module';
import { CommunityMemberModule } from '../communityMember/communityMember.module';
import { TournamentHelper } from './tournament.helper';
import { WalletModule } from '../wallet/wallet.module';
import { TransactionModule } from '../transaction/transaction.module';
import { TeamModule } from '../team/team.module';
import { TournamentParticipantModule } from '../tournamentParticipant/tournamentParticipant.module';

@Module({
  imports: [
    TeamModule,
    GameModule,
    WalletModule,
    ThirdPartyModule,
    forwardRef(() => TransactionModule),
    CommunityMemberModule,
    TournamentParticipantModule,
    SequelizeModule.forFeature([Tournament]),
  ],
  providers: [TournamentService, TournamentHelper],
  controllers: [TournamentController],
  exports: [TournamentService],
})
export class TournamentModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(...USER_VERIFIED_MIDDLEWARE).forRoutes(TournamentController);
  }
}
