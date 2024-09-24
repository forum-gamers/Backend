import { Injectable, type NestMiddleware } from '@nestjs/common';
import RateLimit from 'express-rate-limit';

@Injectable()
export class GlobalLimiter implements NestMiddleware {
  public use = RateLimit({ windowMs: 1 * 60 * 1000, max: 500 });
}
