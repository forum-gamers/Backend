import { TransactionStatus } from 'src/constants/transaction.constant';
import type { Supported_Currency } from 'src/interfaces/model.interface';
import type { TransactionType } from 'src/interfaces/transaction.interface';
import { v4 } from 'uuid';

export class CreateTransactionDto {
  userId: string;
  amount: number;
  type: TransactionType;
  currency: Supported_Currency = 'IDR';
  status: TransactionStatus.PENDING;
  description?: string;
  detail?: string;
  signature: string;
  discount: number;
  fee: number;
  tax: number;
  id = v4();

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
}
