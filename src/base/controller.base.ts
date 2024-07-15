import { ERROR_NAME } from '../constants/global.constant';
import type {
  IRespBody,
  IRespBodyProps,
  PaginationRespProps,
} from '../interfaces/response.interface';

export abstract class BaseController {
  protected sendResponseBody = (
    { message, data, code }: IRespBodyProps,
    opts?: PaginationRespProps,
  ): IRespBody => ({
    code,
    message,
    status: ERROR_NAME[code],
    data,
    ...opts,
  });
}
