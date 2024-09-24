export interface UpdateCommunityDtoProps {
  name: string;
  description: string;
  imageUrl: string;
  imageId: string;
}

export class UpdateCommunityDto {
  name: string;
  description: string;
  imageUrl: string;
  imageId: string;
  constructor(props: Partial<UpdateCommunityDtoProps>) {
    this.name = props.name;
    this.description = props.description;
    this.imageUrl = props.imageUrl;
    this.imageId = props.imageId;
  }

  public updateImage(imageUrl: string, imageId: string) {
    this.imageUrl = imageUrl;
    this.imageId = imageId;
  }
}
