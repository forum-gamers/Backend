import {
  ForbiddenException,
  Injectable,
  type NestMiddleware,
} from '@nestjs/common';
import type { RequestHandler } from 'express';

@Injectable()
export class UserOnly implements NestMiddleware {
  public use: RequestHandler = (req, res, next) => {
    if (!req?.user) throw new ForbiddenException('forbidden');

    next();
  };
}
