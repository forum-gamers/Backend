export class CreateShareDto {
  public readonly postId: number;
  public readonly userId: string;

  constructor({ postId, userId }: CreateShareDtoProps) {
    this.postId = postId;
    this.userId = userId;
  }
}

export interface CreateShareDtoProps {
  userId: string;
  postId: number;
}
