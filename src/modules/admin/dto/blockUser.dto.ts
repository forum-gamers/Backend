export interface BlockUserDtoProps {
  userId: string;
  reason: string;
  blockedBy: string;
}

export class BlockUserDto {
  userId: string;
  reason: string;
  blockedBy: string;

  constructor({ userId, reason, blockedBy }: BlockUserDtoProps) {
    this.userId = userId;
    this.reason = reason;
    this.blockedBy = blockedBy;
  }
}
