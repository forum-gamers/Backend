import { HttpException, HttpStatus } from '@nestjs/common';

export class PaymentRequiredException extends HttpException {
  constructor(msg: string = 'payment required') {
    super(msg, HttpStatus.PAYMENT_REQUIRED);
  }
}
