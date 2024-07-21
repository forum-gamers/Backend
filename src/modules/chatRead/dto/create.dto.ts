export class CreateChatReadDto {
  public chatId: number;
  public userId: string;

  constructor({ chatId, userId }: CreateChatReadDtoProps) {
    this.chatId = chatId;
    this.userId = userId;
  }
}

export interface CreateChatReadDtoProps {
  chatId: number;
  userId: string;
}
