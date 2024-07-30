export interface CreateReplyDtoProps {
  commentId: number;
  userId: string;
  text: string;
  postId: number;
}

export class CreateReplyDto {
  public commentId: number;
  public userId: string;
  public text: string;
  public postId: number;
  constructor({ commentId, userId, text, postId }: CreateReplyDtoProps) {
    this.commentId = commentId;
    this.userId = userId;
    this.text = text;
    this.postId = postId;
  }
}
