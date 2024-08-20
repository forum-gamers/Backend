import type { EnablePayment, PaymentType } from 'midtrans-client';
import type { BankProvider } from 'src/interfaces/transaction.interface';

export interface ChargeTopupViaBankProps extends ChargeTopupProps {
  bank: BankProvider;
}

export interface ChargeTopupViaEWalletProps extends ChargeTopupProps {
  provider: EnablePayment;
}

export interface TopUpPayload {
  payment_type: PaymentType;
  amount: number;
  username: string;
  email: string;
  phone: string;
  provider?: BankProvider;
}

export interface ChargeTopupProps {
  username: string;
  email: string;
  amount: number;
}
