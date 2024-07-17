export class CreateCommunityDto {
  public readonly name: string;
  public readonly description?: string;
  public imageUrl?: string;
  public imageId?: string;
  public readonly owner: string;

  constructor(props: CreateCommunityDtoProps) {
    this.name = props.name;
    this.description = props.description;
    this.imageUrl = props.imageUrl;
    this.imageId = props.imageId;
    this.owner = props.owner;
  }

  public updateImage(imageUrl: string, imageId: string) {
    this.imageUrl = imageUrl;
    this.imageId = imageId;
  }
}

export interface CreateCommunityDtoProps {
  name: string;
  description?: string;
  imageUrl?: string;
  imageId?: string;
  owner: string;
}
