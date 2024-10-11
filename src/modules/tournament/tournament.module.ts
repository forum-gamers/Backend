import {
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

@Module({
  imports: [
    GameModule,
    WalletModule,
    ThirdPartyModule,
    TransactionModule,
    CommunityMemberModule,
    SequelizeModule.forFeature([Tournament]),
  ],
  providers: [TournamentService, TournamentHelper],
  controllers: [TournamentController],
})
export class TournamentModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(...USER_VERIFIED_MIDDLEWARE).forRoutes(TournamentController);
  }
}
