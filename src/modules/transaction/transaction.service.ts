import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UpdateOptions, type CreateOptions, type FindOptions } from 'sequelize';
import { TransactionStatus } from 'src/constants/transaction.constant';
import type { TransactionType } from 'src/interfaces/transaction.interface';
import {
  Transaction,
  type TransactionAttributes,
} from 'src/models/transaction';
import { CreateTransactionDto } from './dto/create.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction)
    private readonly transactionModel: typeof Transaction,
  ) {}

  public findActiveUserTransactionByType(
    userId: string,
    type: TransactionType,
    opts?: Omit<FindOptions<TransactionAttributes>, 'where'>,
  ) {
    return this.transactionModel.findAll({
      ...opts,
      where: { userId, status: TransactionStatus.PENDING, type },
    });
  }

  public async create(
    payload: CreateTransactionDto,
    opts?: CreateOptions<TransactionAttributes>,
  ) {
    return this.transactionModel.create(payload, opts);
  }

  public async findBySignature(
    signature: string,
    opts?: Omit<FindOptions<TransactionAttributes>, 'where'>,
  ) {
    return this.transactionModel.findOne({ ...opts, where: { signature } });
  }

  public async updateStatus(
    id: string,
    status: TransactionStatus,
    opts?: Omit<UpdateOptions<TransactionAttributes>, 'where'>,
  ) {
    return await this.transactionModel.update(
      { status },
      { ...opts, where: { id } },
    );
  }
}
