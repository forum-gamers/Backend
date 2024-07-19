import type {
  ChatFileType,
  ChatStatusType,
  RoomChatType,
  RoomMemberType,
} from 'src/interfaces/model.interface';

export class ChatCtxDto {
  public roomId: number;
  public userId: string;
  public message?: string;
  public file?: string;
  public fileId?: string;
  public fileType?: ChatFileType;
  public isRead: boolean;
  public status: ChatStatusType;
  public roomOwner: string;
  public roomName?: string;
  public roomImage?: string;
  public roomImageId?: string;
  public roomDescription?: string;
  public roomType: RoomChatType;
  public role: RoomMemberType;
  public id: number;
}
