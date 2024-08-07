import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { RequestHandler } from 'express';
import { AdminLogService } from 'src/modules/adminLog/adminLog.service';
import { CreateAdminLogDto } from 'src/modules/adminLog/dto/create.dto';

@Injectable()
export class AdminLogger implements NestMiddleware {
  public use: RequestHandler = (req, res, next) => {
    if (!req?.admin) return next();

    const { method, originalUrl } = req;
    const { id } = req.admin;

    res.on('finish', () => {
      const { statusCode } = res;

      this.adminLogService.create(
        new CreateAdminLogDto({
          adminId: id,
          path: originalUrl,
          statusCode,
          method,
        }),
      );
    });
    next();
  };

  constructor(private readonly adminLogService: AdminLogService) {}
}
