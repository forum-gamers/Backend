import { Controller } from '@nestjs/common';
import { BaseController } from 'src/base/controller.base';
import { TransactionService } from './transaction.service';
import { MidtransService } from 'src/third-party/midtrans/midtrans.service';
import { MailService } from 'src/third-party/mail/mail.service';

@Controller('transaction')
export class TransactionController extends BaseController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly midtransService: MidtransService,
    private readonly mailService: MailService,
  ) {
    super();
  }
}
