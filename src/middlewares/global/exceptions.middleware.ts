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
import { HostNotFoundError, HostNotReachableError } from 'sequelize';

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

    if (exception instanceof JsonWebTokenError) {
      status = HttpStatus.UNAUTHORIZED;
      message = 'missing or invalid authorization';
    }

    if (exception instanceof TokenExpiredError) {
      status = HttpStatus.UNAUTHORIZED;
      message = 'token expired';
    }

    if (
      exception instanceof HostNotFoundError ||
      exception instanceof HostNotReachableError
    ) {
      status = HttpStatus.GATEWAY_TIMEOUT;
      message = 'server connection lost';
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) console.log(exception);

    host
      .switchToHttp()
      .getResponse<Response>()
      .status(status)
      .json(this.sendResponseBody({ message, code: status }));
  }
}
