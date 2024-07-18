import type { RoomMemberType } from 'src/interfaces/model.interface';

export interface CreateRoomMemberDtoProps {
  userId: string;
  roomId: number;
  role: RoomMemberType;
}

export class CreateRoomMemberDto {
  public readonly userId: string;
  public readonly roomId: number;
  public readonly role: RoomMemberType;

  constructor({ userId, roomId, role }: CreateRoomMemberDtoProps) {
    this.userId = userId;
    this.roomId = roomId;
    this.role = role;
  }
}
