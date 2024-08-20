import type { EnablePayment } from 'midtrans-client';

export type BankProvider = 'BCA' | 'MANDIRI' | 'BNI' | 'BRI' | 'PERMATA';

export type PaymentProvider = BankProvider | EnablePayment;

export type TransactionType = 'topup' | 'payment' | 'refund' | 'settlement';
