import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BaseController } from 'src/base/controller.base';
import { TransactionService } from './transaction.service';
import { MidtransService } from 'src/third-party/midtrans/midtrans.service';
import { UserMe } from '../user/decorators/me.decorator';
import { TransactionValidation } from './transaction.validation';
import { RateLimitGuard } from 'src/middlewares/global/rateLimit.middleware';
import {
  BANK_PROVIDERS,
  EWALLET_PROVIDERS,
  TransactionType,
} from 'src/constants/transaction.constant';
import { type UserAttributes } from 'src/models/user';
import type { BankProvider } from 'src/interfaces/transaction.interface';
import type { ChargeResp, EnablePayment } from 'midtrans-client';
import { CreateTransactionDto } from './dto/create.dto';

@Controller('transaction')
export class TransactionController extends BaseController {
  constructor(
    private readonly transactionValidation: TransactionValidation,
    private readonly transactionService: TransactionService,
    private readonly midtransService: MidtransService,
  ) {
    super();
  }

  @Post('top-up')
  @HttpCode(201)
  @UseGuards(
    new RateLimitGuard({
      windowMs: 1 * 60 * 1000,
      max: 10,
      message: 'Too many requests from this IP, please try again in 1 minute.',
    }),
  )
  public async topUp(@UserMe() user: UserAttributes, @Body() payload: any) {
    const { paymentType, amount } =
      await this.transactionValidation.validateTopup(payload);

    if (
      (
        await this.transactionService.findActiveUserTransactionByType(
          user.id,
          TransactionType.TOPUP,
        )
      )?.length
    )
      throw new ConflictException('You have an active top up transaction');

    let charge: ChargeResp;
    switch (true) {
      case BANK_PROVIDERS.includes(paymentType as BankProvider):
        charge = await this.midtransService.chargeTopupViaBank({
          username: user.username,
          email: user.email,
          amount,
          bank: paymentType as BankProvider,
        });
        break;
      case EWALLET_PROVIDERS.includes(paymentType as EnablePayment):
        charge = await this.midtransService.chargeTopupViaEwallet({
          username: user.username,
          email: user.email,
          amount,
          provider: paymentType as EnablePayment,
        });
        break;
      default:
        throw new ConflictException('Unsupported payment type');
    }

    const transaction = await this.transactionService.create(
      new CreateTransactionDto({
        type: TransactionType.TOPUP,
        userId: user.id,
        signature: this.midtransService.generateSignature(
          charge.order_id,
          200,
          +charge.gross_amount,
        ),
        amount: +charge.gross_amount,
        fee: 0,
        tax: 0,
        discount: 0,
        description: 'Topup wallet via ' + paymentType,
      }),
    );

    return this.sendResponseBody({
      message: 'Topup transaction created',
      data: {
        orderId: charge.order_id,
        grossAmount: +charge.gross_amount,
        paymentType: charge.payment_type,
        transactionId: transaction.dataValues.id,
        permataVaNumber: charge.permata_va_number,
        transactionStatus: charge.transaction_status,
        statusMessage: charge.status_message,
        actions: charge.actions ?? [],
        vaNumbers: charge.va_numbers ?? [],
      },
      code: 201,
    });
  }
}
