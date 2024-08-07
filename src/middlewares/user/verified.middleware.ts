import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  type NestMiddleware,
} from '@nestjs/common';
import type { RequestHandler } from 'express';

@Injectable()
export class VerifiedMiddleware implements NestMiddleware {
  public use: RequestHandler = (req, res, next) => {
    if (!!req?.admin) return next();

    if (!req?.user?.isVerified)
      throw new UnauthorizedException(
        'you must be verified to access this endpoint',
      );

    if (req?.user?.isBlocked)
      throw new ForbiddenException('blocked users cannot access this endpoint');

    next();
  };
}
