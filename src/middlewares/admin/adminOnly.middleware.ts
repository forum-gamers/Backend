import {
  ForbiddenException,
  Injectable,
  type NestMiddleware,
} from '@nestjs/common';
import type { RequestHandler } from 'express';

@Injectable()
export class AdminOnly implements NestMiddleware {
  public use: RequestHandler = (req, res, next) => {
    if (!req?.admin) throw new ForbiddenException('forbidden');

    next();
  };
}
