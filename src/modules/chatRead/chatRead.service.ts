import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ChatRead, type ChatReadAttributes } from 'src/models/chatread';
import { type CreateOptions } from 'sequelize';
import { CreateChatReadDto } from './dto/create.dto';

@Injectable()
export class ChatReadService {
  constructor(
    @InjectModel(ChatRead)
    private readonly chatReadModel: typeof ChatRead,
  ) {}

  public async create(
    payload: CreateChatReadDto,
    opts?: CreateOptions<ChatReadAttributes>,
  ) {
    return await this.chatReadModel.create(payload, opts);
  }
}
