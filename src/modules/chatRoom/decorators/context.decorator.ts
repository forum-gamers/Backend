import {
  createParamDecorator,
  InternalServerErrorException,
  type ExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';

export type ChatContextKey = 'roomChat' | 'roomMember';

export const ChatContext = createParamDecorator(
  (key: ChatContextKey, ctx: ExecutionContext) => {
    const { roomChat, roomMember } = ctx.switchToHttp().getRequest<Request>();

    if (!roomChat || !roomMember)
      throw new InternalServerErrorException(
        'you must use this decorator on authenticated chat/roomChat endpoint',
      );

    let result: Record<ChatContextKey, any> = {
      roomChat,
      roomMember,
    };

    if (key && ['roomChat', 'roomMember'].includes(key)) result = result[key];

    return result;
  },
);
