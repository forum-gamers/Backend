import {
  Injectable,
  UnauthorizedException,
  type NestMiddleware,
} from '@nestjs/common';
import type { RequestHandler } from 'express';

@Injectable()
export class VerifiedMiddleware implements NestMiddleware {
  public use: RequestHandler = (req, res, next) => {
    if (!req?.user?.isVerified && !req?.admin)
      throw new UnauthorizedException(
        'you must be verified to access this endpoint',
      );
    next();
  };
}
