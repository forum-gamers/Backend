export class CreateLikeDto {
  public readonly postId: number;
  public readonly userId: string;

  constructor({ postId, userId }: CreateLikeDtoProps) {
    this.postId = postId;
    this.userId = userId;
  }
}

export interface CreateLikeDtoProps {
  userId: string;
  postId: number;
}
