import { Injectable } from '@nestjs/common';
import { type ChargeResp } from 'midtrans-client';

@Injectable()
export class TransactionHelper {
  public generateTransactionResponse(
    transactionId: string,
    charge: ChargeResp,
  ) {
    return {
      orderId: charge.order_id,
      grossAmount: +charge.gross_amount,
      paymentType: charge.payment_type,
      transactionId: transactionId,
      permataVaNumber: charge.permata_va_number,
      transactionStatus: charge.transaction_status,
      statusMessage: charge.status_message,
      actions: charge.actions ?? [],
      vaNumbers: charge.va_numbers ?? [],
    };
  }
}
