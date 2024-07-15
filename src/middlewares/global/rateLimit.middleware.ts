import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import RateLimit, {
  type Options,
  type RateLimitRequestHandler,
} from 'express-rate-limit';
import type { Observable } from 'rxjs';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private limiter: RateLimitRequestHandler;
  constructor({
    windowMs,
    max,
    message = 'Too many requests from this IP, please try again later.',
    ...rest
  }: Partial<Options>) {
    this.limiter = RateLimit({ windowMs, message, max, ...rest });
  }

  public canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    return new Promise<boolean>((resolve, reject) => {
      this.limiter(req, res, (result) => {
        if (result instanceof Error) {
          reject(result);
        } else {
          resolve(true);
        }
      });
    });
  }
}
