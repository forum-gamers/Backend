import {
  createParamDecorator,
  InternalServerErrorException,
  type ExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';

export const UserMe = createParamDecorator(
  (key: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();

    const user = req.user;
    if (!user)
      throw new InternalServerErrorException(
        'you must use this decorator on authenticated user endpoint',
      );

    let result = user;
    if (key) result = user[key];

    if (!result)
      throw new InternalServerErrorException(`teacher have no field ${key}`);

    return result;
  },
);
