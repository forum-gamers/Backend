import type { PaymentOptions } from '../transaction/transaction.interface';

export interface CreateTournamentBodyProps extends Partial<PaymentOptions> {
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
}

export interface JointTournamentProps extends Partial<PaymentOptions> {
  teamId: string;
}
