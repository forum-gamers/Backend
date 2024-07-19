import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Chat, type ChatAttributes } from 'src/models/chat';
import { CreateChatDto } from './dto/create.dto';
import { type CreateOptions } from 'sequelize';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat)
    private readonly chatModel: typeof Chat,
  ) {}

  public async create(
    payload: CreateChatDto,
    opts?: CreateOptions<ChatAttributes>,
  ) {
    return await this.chatModel.create(payload, opts);
  }
}
