export class CreateFollowDto {
  public readonly followerId: string;
  public readonly followedId: string;

  constructor({ followerId, followedId }: CreateFollowDtoProps) {
    this.followerId = followerId;
    this.followedId = followedId;
  }
}

export interface CreateFollowDtoProps {
  followerId: string;
  followedId: string;
}
