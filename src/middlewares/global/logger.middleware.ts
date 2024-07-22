import { Inject, Injectable, type NestMiddleware } from '@nestjs/common';
import type { RequestHandler } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  public use: RequestHandler = (req, res, next) => {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent');

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length') ?? 0;

      this.logger.info({
        message: `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
      });
    });
    next();
  };

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}
}
