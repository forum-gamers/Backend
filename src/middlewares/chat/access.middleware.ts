import {
  BadRequestException,
  Injectable,
  NotFoundException,
  type NestMiddleware,
} from '@nestjs/common';
import type { RequestHandler } from 'express';
import { ChatService } from 'src/modules/chat/chat.service';

/**
 * @info
 * @description
 * always bring chatRoom 'chatId' on request params except create
 */
@Injectable()
export class ChatAccessMiddleware implements NestMiddleware {
  public use: RequestHandler = async (req, res, next) => {
    const { chatId } = req.params;

    const value = parseInt(chatId);
    if (isNaN(value)) throw new BadRequestException('chatId must be a number');

    const data = await this.chatService.findByIdAndPreloadRelated(value);
    if (!data) throw new NotFoundException('chat not found');

    req.chatCtx = data;

    next();
  };

  constructor(private readonly chatService: ChatService) {}
}
