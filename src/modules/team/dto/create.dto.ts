import type { GameAttributes } from 'src/models/game';
import { v4 } from 'uuid';

export class CreateTeamDto {
  name: string;
  description?: string;
  owner: string;
  imageUrl?: string;
  imageId?: string;
  id = v4();
  totalMember = 1;
  gameId: number;
  maxMember: number;
  isPublic = true;

  constructor({
    name,
    description,
    owner,
    game,
    isPublic,
  }: CreateTeamDtoProps) {
    this.name = name;
    this.description = description;
    this.owner = owner;
    this.gameId = game.id;
    this.maxMember = game.minPlayer;
    this.isPublic = isPublic;
  }

  public addImage(imageUrl: string, imageId: string) {
    this.imageUrl = imageUrl;
    this.imageId = imageId;
  }
}

export interface CreateTeamDtoProps {
  name: string;
  description?: string;
  owner: string;
  game: GameAttributes;
  isPublic: boolean;
}
