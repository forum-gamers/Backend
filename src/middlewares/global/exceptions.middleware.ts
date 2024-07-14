import {
  type ArgumentsHost,
  Catch,
  HttpException,
  type ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { BaseController } from '../../base/controller.base';

@Catch()
export class AllExceptionsFilter
  extends BaseController
  implements ExceptionFilter
{
  public catch(exception: HttpException, host: ArgumentsHost) {
    let message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal Server Error';
    let status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    if (
      exception instanceof JsonWebTokenError ||
      exception instanceof TokenExpiredError
    ) {
      status = 401;
      message = 'missing or invalid authorization';
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) console.log(exception);

    host
      .switchToHttp()
      .getResponse<Response>()
      .status(status)
      .json(this.sendResponseBody({ message, code: status }));
  }
}
