import type { PostPrivacy } from 'src/interfaces/model.interface';

export interface CreatePostDtoProps {
  text?: string;
  userId: string;
  allowComment?: boolean;
  privacy?: PostPrivacy;
  communityId?: number;
}

export class CreatePostDto {
  public readonly text?: string;
  public readonly userId: string;
  public readonly allowComment: boolean;
  public readonly privacy: PostPrivacy;
  public readonly communityId?: number;
  public readonly totalLike = 0;

  constructor({
    text,
    userId,
    allowComment = true,
    privacy = 'public',
    communityId,
  }: CreatePostDtoProps) {
    this.text = text;
    this.userId = userId;
    this.allowComment = allowComment;
    this.privacy = privacy;
    this.communityId = communityId;
  }
}
