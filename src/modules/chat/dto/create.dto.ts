import type {
  ChatFileType,
  ChatStatusType,
} from 'src/interfaces/model.interface';
import encryption from 'src/utils/global/encryption.utils';
import globalUtils from 'src/utils/global/global.utils';

export class CreateChatDto {
  public readonly roomId: number;
  public readonly senderId: string;
  public readonly message?: string;
  public file?: string;
  public fileId?: string;
  public isRead = false;
  public status: ChatStatusType = 'plain';
  public fileType: ChatFileType;

  constructor({ roomId, senderId, message }: CreateChatDtoProps) {
    this.roomId = roomId;
    this.senderId = senderId;
    if (!!message) this.message = encryption.createChatEncryption(message);
  }

  public updateImage(url: string, fileId: string) {
    this.file = url;
    this.fileId = fileId;
    const type = globalUtils.getFileExtFromUrl(url);
    if (type !== 'unsupported file type') this.fileType = type;
  }
}

export interface CreateChatDtoProps {
  roomId: number;
  senderId: string;
  message: string;
}
