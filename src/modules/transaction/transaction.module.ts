import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Transaction } from 'src/models/transaction';
import { ThirdPartyModule } from 'src/third-party/third-party.module';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';

@Module({
  imports: [SequelizeModule.forFeature([Transaction]), ThirdPartyModule],
  providers: [TransactionService],
  exports: [TransactionService],
  controllers: [TransactionController],
})
export class TransactionModule {}
