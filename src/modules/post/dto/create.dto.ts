import type { PostPrivacy } from 'src/interfaces/model.interface';

export interface CreatePostDtoProps {
  text?: string;
  userId: string;
  allowComment?: boolean;
  privacy?: PostPrivacy;
  communityId?: number;
  tags: string[];
}

export class CreatePostDto {
  public readonly text?: string;
  public readonly userId: string;
  public readonly allowComment: boolean;
  public readonly privacy: PostPrivacy;
  public readonly communityId?: number;
  public readonly totalLike = 0;
  public readonly tags: string[];

  constructor({
    text,
    userId,
    allowComment = true,
    privacy = 'public',
    communityId,
    tags = [],
  }: CreatePostDtoProps) {
    this.text = text;
    this.userId = userId;
    this.allowComment = allowComment;
    this.privacy = privacy;
    this.communityId = communityId;
    this.tags = tags;
  }
}
