import type { CommunityMemberRole } from 'src/interfaces/model.interface';

export interface CreateCommunityMemberDtoProps {
  userId: string;
  communityId: number;
  role: CommunityMemberRole;
}

export class CreateCommunityMemberDto {
  public readonly userId: string;
  public readonly communityId: number;
  public readonly role: CommunityMemberRole;

  constructor({ userId, communityId, role }: CreateCommunityMemberDtoProps) {
    this.userId = userId;
    this.communityId = communityId;
    this.role = role;
  }
}
