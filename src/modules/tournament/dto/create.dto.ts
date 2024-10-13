import { InternalServerErrorException } from '@nestjs/common';
import type { TournamentStatus } from 'src/interfaces/model.interface';

export interface CreateTournamentDtoProps {
  name: string;
  gameId: number;
  pricePool: number;
  slot: number;
  startDate: Date;
  registrationFee: number;
  description?: string;
  imageUrl: string;
  imageId: string;
  userId?: string | null;
  communityId?: number | null;
  location: string;
  tags: string[];
  isPublic?: boolean;
  moneyPool: number;
}

export class CreateTournamentDto {
  name: string;
  gameId: number;
  pricePool: number;
  slot: number;
  startDate: Date;
  registrationFee: number;
  description?: string;
  imageUrl: string;
  imageId: string;

  userId?: string | null;
  communityId?: number | null;
  location: string;
  tags: string[];
  status: TournamentStatus = 'preparation';
  isPublic = true;
  moneyPool = 0;
  context = {};

  constructor({
    name,
    gameId,
    pricePool,
    slot,
    startDate,
    registrationFee,
    description,
    imageUrl,
    imageId,
    userId,
    communityId,
    location,
    tags,
    isPublic = true,
    moneyPool = 0,
  }: CreateTournamentDtoProps) {
    this.name = name;
    this.gameId = gameId;
    this.pricePool = pricePool;
    this.slot = slot;
    this.startDate = startDate;
    this.registrationFee = registrationFee;
    this.description = description;
    this.imageUrl = imageUrl;
    this.imageId = imageId;
    this.userId = userId;
    this.communityId = communityId;
    this.location = location;
    this.tags = tags;
    this.isPublic = isPublic;
    this.moneyPool = moneyPool;

    if (!userId && !communityId)
      throw new InternalServerErrorException(
        'oneof userId or communityId is required',
      );
  }
}
