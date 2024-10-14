import type { TournamentStatus } from 'src/interfaces/model.interface';
import type { PaymentOptions } from '../transaction/transaction.interface';
import { BaseUserDto } from '../user/dto/baseUser.dto';
import { GetCommunityDto } from '../community/dto/get.dto';

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

export interface TournamentData {
  id: number;
  name: string;
  pricePool: number;
  slot: number;
  startDate: Date;
  registrationFee: number;
  description?: string;
  location: string;
  tags: string[];
  status: TournamentStatus;
  isPublic: boolean;
  liveOn?: string;
  user?: BaseUserDto;
  community: GetCommunityDto;
}

export interface TournamentDataDBResult {
  datas: TournamentData[];
  totalData: number;
}
