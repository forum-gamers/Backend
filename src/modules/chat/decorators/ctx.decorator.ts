import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Request } from 'express';

export const ChatContext = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const { chatCtx } = ctx.switchToHttp().getRequest<Request>();

    if (!chatCtx)
      throw new InternalServerErrorException(
        'you must use this decorator after ChatAccessMiddleware middleware',
      );

    let result = chatCtx;
    if (data) result = result[data];

    return result;
  },
);
