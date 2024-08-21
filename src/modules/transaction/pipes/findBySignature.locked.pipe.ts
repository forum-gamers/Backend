import {
  type ArgumentMetadata,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import { TransactionService } from '../transaction.service';
import { Transaction } from 'sequelize';
import { type TransactionAttributes } from 'src/models/transaction';

@Injectable()
export class TransactionFindBySignaturePipe
  implements PipeTransform<string, Promise<TransactionAttributes | null>>
{
  public async transform(
    value: any,
    metadata: ArgumentMetadata,
  ): Promise<TransactionAttributes | null> {
    return await this.transactionService.findBySignature(value, {
      lock: Transaction.LOCK.UPDATE,
    });
  }

  constructor(private readonly transactionService: TransactionService) {}
}
