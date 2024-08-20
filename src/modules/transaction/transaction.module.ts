import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Transaction } from 'src/models/transaction';
import { ThirdPartyModule } from 'src/third-party/third-party.module';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TransactionValidation } from './transaction.validation';
import { USER_VERIFIED_MIDDLEWARE } from 'src/constants/global.constant';

@Module({
  imports: [SequelizeModule.forFeature([Transaction]), ThirdPartyModule],
  providers: [TransactionService, TransactionValidation],
  exports: [TransactionService],
  controllers: [TransactionController],
})
export class TransactionModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(...USER_VERIFIED_MIDDLEWARE)
      .forRoutes(TransactionController);
  }
}
