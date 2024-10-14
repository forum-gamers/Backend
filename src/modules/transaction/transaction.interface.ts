import type { EWalletActionResp, VaNumber } from 'midtrans-client';
import type { PaymentProvider } from 'src/interfaces/transaction.interface';

export interface TopupProps {
  amount: number;
  paymentType: PaymentProvider;
}

export type PaymentType = 'wallet' | 'transfer';

export interface PaymentOptions {
  paymentType: PaymentType;
  paymentMethod: PaymentProvider;
}

export interface TransactionResponse {
  orderId: string;
  grossAmount: number;
  paymentType: string;
  transactionId: string;
  permataVaNumber: string;
  transactionStatus: string;
  statusMessage: string;
  actions: EWalletActionResp[];
  vaNumbers: VaNumber[];
}
