export interface BlockPostDtoProps {
  postId: number;
  reason: string;
  blockedBy: string;
}

export class BlockPostDto {
  postId: number;
  reason: string;
  blockedBy: string;

  constructor({ postId, reason, blockedBy }: BlockPostDtoProps) {
    this.postId = postId;
    this.reason = reason;
    this.blockedBy = blockedBy;
  }
}
