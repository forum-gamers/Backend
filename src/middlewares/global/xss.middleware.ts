import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { RequestHandler } from 'express';
import xss from 'xss';

@Injectable()
export class XssMiddleware implements NestMiddleware {
  public use: RequestHandler = (req, res, next) => {
    ['body', 'query', 'params'].forEach((key) => {
      this.sanitize(req[key]);
    });

    next();
  };

  private sanitize(obj: any) {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.sanitize(obj[key]);
      } else if (typeof obj[key] === 'string') {
        obj[key] = xss(obj[key]);
      }
    }
  }
}
