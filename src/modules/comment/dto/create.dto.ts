export class CreateCommentDto {
  public readonly postId: number;
  public readonly userId: string;
  public readonly text: string;

  constructor({ userId, postId, text }: CreateCommentDtoProps) {
    this.postId = postId;
    this.userId = userId;
    this.text = text;
  }
}

export interface CreateCommentDtoProps {
  userId: string;
  postId: number;
  text: string;
}
