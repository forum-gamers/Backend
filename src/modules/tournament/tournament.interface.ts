import type { PaymentProvider } from 'src/interfaces/transaction.interface';

export interface CreateTournamentBodyProps {
  name: string;
  gameId: number;
  pricePool: number;
  slot: number;
  startDate: Date;
  registrationFee: number;
  description?: string;
  location: string;
  tags: string[];
  communityId?: number | null;
  isPublic?: boolean;
  paymentType: 'wallet' | 'transfer';
  paymentMethod?: PaymentProvider | null;
}
