import {
  createParamDecorator,
  InternalServerErrorException,
  type ExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';
import type { AdminAttributes } from 'src/models/admin';

export const AdminMe = createParamDecorator(
  (key: keyof AdminAttributes, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();

    const admin = req.admin;
    if (!admin)
      throw new InternalServerErrorException(
        'you must use this decorator on authenticated admin endpoint',
      );

    let result: AdminAttributes | string | Date = admin;
    if (key) result = admin[key];

    if (!result)
      throw new InternalServerErrorException(`user have no field ${key}`);

    return result;
  },
);
