export class CreateBookmarkDto {
  public readonly postId: number;
  public readonly userId: string;

  constructor({ postId, userId }: CreateBookmarkDtoProps) {
    this.postId = postId;
    this.userId = userId;
  }
}

export interface CreateBookmarkDtoProps {
  userId: string;
  postId: number;
}
