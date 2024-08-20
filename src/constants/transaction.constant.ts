import type { EnablePayment } from 'midtrans-client';
import type { BankProvider } from 'src/interfaces/transaction.interface';

export const BANK_PROVIDERS: BankProvider[] = [
  'BCA',
  'BNI',
  'BRI',
  'MANDIRI',
  'PERMATA',
];

export const EWALLET_PROVIDERS: EnablePayment[] = [
  'gopay',
  'shopeepay',
  'credit_card',
  'cimb_clicks',
  'bca_klikbca',
  'bca_klikpay',
  'bri_epay',
  'echannel',
  'permata_va',
  'bca_va',
  'bni_va',
  'bri_va',
  'cimb_va',
  'other_va',
  'indomaret',
  'danamon_online',
  'akulaku',
  'kredivo',
  'uob_ezpay',
  'other_qris',
];

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETE = 'completed',
  FAILED = 'failed',
  CANCEL = 'cancel',
  REFUND = 'refund',
  SETTLEMENT = 'settlement',
  DENY = 'deny',
  EXPIRE = 'expire',
}

export enum TransactionType {
  TOPUP = 'topup',
  PAYMENT = 'payment',
  REFUND = 'refund',
  SETTLEMENT = 'settlement',
}

export enum ITEM_ID {
  TOPUP_ITEM_ID = 'FGTP',
  TRANSACTION_MIDTRANS_FEE = 'FGMF',
}
