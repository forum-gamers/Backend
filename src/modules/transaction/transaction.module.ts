import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Transaction } from 'src/models/transaction';
import { ThirdPartyModule } from 'src/third-party/third-party.module';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TransactionValidation } from './transaction.validation';
import { USER_VERIFIED_MIDDLEWARE } from 'src/constants/global.constant';
import { WalletModule } from '../wallet/wallet.module';
import { TransactionHelper } from './transaction.helper';

@Module({
  imports: [
    SequelizeModule.forFeature([Transaction]),
    ThirdPartyModule,
    WalletModule,
  ],
  providers: [TransactionService, TransactionValidation, TransactionHelper],
  exports: [TransactionService, TransactionHelper],
  controllers: [TransactionController],
})
export class TransactionModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(...USER_VERIFIED_MIDDLEWARE)
      .forRoutes({ path: '/transaction/top-up', method: RequestMethod.POST });
  }
}
