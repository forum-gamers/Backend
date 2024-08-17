import {
  createParamDecorator,
  InternalServerErrorException,
  type ExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';
import type { UserAttributes } from 'src/models/user';

export const UserMe = createParamDecorator(
  (key: keyof UserAttributes, ctx: ExecutionContext) => {
    const { user = null } = ctx.switchToHttp().getRequest<Request>();
    if (!user)
      throw new InternalServerErrorException(
        'you must use this decorator on authenticated user endpoint',
      );

    let result = user;
    if (key) result = user[key];

    if (!result)
      throw new InternalServerErrorException(`user have no field ${key}`);

    return result;
  },
);
