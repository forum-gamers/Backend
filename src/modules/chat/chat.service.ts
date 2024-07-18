import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Chat } from 'src/models/chat';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat)
    private readonly chatModel: typeof Chat,
  ) {}
}
