import type { PaymentProvider } from 'src/interfaces/transaction.interface';

export interface TopupProps {
  amount: number;
  paymentType: PaymentProvider;
}
