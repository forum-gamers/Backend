import type { RoomChatType } from 'src/interfaces/model.interface';

export class CreateRoomChatDto {
  public readonly owner: string;
  public readonly name?: string;
  public readonly description?: string;
  public image?: string;
  public imageId: string;
  public readonly type: RoomChatType;

  constructor({ owner, name, description, type }: CreateRoomChatDtoProps) {
    this.owner = owner;
    this.type = type;
    if (this.type === 'group') {
      this.name = name;
      this.description = description;
    }
  }

  public updateImage(imageUrl: string, imageId: string) {
    this.image = imageUrl;
    this.imageId = imageId;
  }
}

export interface CreateRoomChatDtoProps {
  owner: string;
  name?: string;
  description?: string;
  type: RoomChatType;
}
