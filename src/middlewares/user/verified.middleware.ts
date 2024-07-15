import {
  Injectable,
  UnauthorizedException,
  type NestMiddleware,
} from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class VerifiedMiddleware implements NestMiddleware {
  public use(req: Request, res: Response, next: NextFunction) {
    if (!req?.user?.isVerified)
      throw new UnauthorizedException(
        'you must be verified to access this endpoint',
      );
    next();
  }
}
