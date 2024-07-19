import type {
  ChatFileType,
  ChatStatusType,
  RoomChatType,
} from 'src/interfaces/model.interface';

export class RoomChatRespDto {
  id: number;
  owner: string;
  name?: string;
  image?: string;
  imageId?: string;
  description?: string;
  type: RoomChatType;
  lastChat: {
    senderId: string;
    message?: string;
    file?: string;
    fileId?: string;
    fileType?: ChatFileType;
    isRead: boolean;
    status: ChatStatusType;
    createdAt: Date;
    updatedAt: Date;

    username: string;
    imageUrl: string;
    backgroundImageUrl: string;
  }[];
}
