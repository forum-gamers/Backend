import { TransactionStatus } from 'src/constants/transaction.constant';
import type { Supported_Currency } from 'src/interfaces/model.interface';
import type { TransactionType } from 'src/interfaces/transaction.interface';
import { v4 } from 'uuid';
import {
  CREATE_TOURNAMENT_TRANSACTION,
  PARTICIPATE_TOURNAMENT,
} from '../transaction.constant';

export class CreateTransactionDto {
  userId: string;
  amount: number;
  type: TransactionType;
  currency: Supported_Currency = 'IDR';
  status: TransactionStatus;
  description?: string;
  detail?: string;
  signature: string;
  discount: number;
  fee: number;
  tax: number;
  id = v4();
  context?: Record<string, any> = {};

  constructor({
    userId,
    amount,
    type,
    description,
    detail,
    signature,
    discount,
    fee,
    tax,
    status = TransactionStatus.PENDING,
  }: CreateTransactionDtoProps) {
    this.userId = userId;
    this.amount = amount;
    this.type = type;
    this.description = description;
    this.detail = detail;
    this.signature = signature;
    this.discount = discount;
    this.fee = fee;
    this.tax = tax;
    this.status = status;
  }
}

export interface CreateTransactionDtoProps {
  userId: string;
  amount: number;
  type: TransactionType;
  description?: string;
  detail?: string;
  signature: string;
  discount?: number;
  fee: number;
  tax: number;
  status?: TransactionStatus;
  context?:
    | CreateTournamentTransactionContext
    | ParticipateTournamentTransactionContext;
}

export type CreateTournamentTransactionContext = {
  type: typeof CREATE_TOURNAMENT_TRANSACTION;
  tournamentId: number;
};

export type ParticipateTournamentTransactionContext = {
  type: typeof PARTICIPATE_TOURNAMENT;
  tournamentId: number;
  teamId: string;
};
