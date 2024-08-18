import { v4 } from 'uuid';

export class CreateTeamDto {
  name: string;
  description?: string;
  owner: string;
  imageUrl?: string;
  imageId?: string;
  id = v4();
  totalMember = 1;

  constructor({ name, description, owner }: CreateTeamDtoProps) {
    this.name = name;
    this.description = description;
    this.owner = owner;
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
}
