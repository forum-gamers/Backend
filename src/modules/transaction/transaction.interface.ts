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
