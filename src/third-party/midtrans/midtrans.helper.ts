import 'dotenv/config';
import type { TransactionType } from 'src/interfaces/transaction.interface';
import { v4 } from 'uuid';
import { sha512 } from 'js-sha512';
import { ItemDetail } from 'midtrans-client';
import { MINIMUM_FREE_ADMIN, ORDER_ID_START_WITH } from './midtrans.constant';
import { ITEM_ID } from 'src/constants/transaction.constant';
import type { OrderType } from './midtrans.interface';

export class MidtransHelper {
  public generateTransactionId(type: TransactionType) {
    return `${ORDER_ID_START_WITH}-${v4()}-${this.generateTransactionType(type)}`;
  }

  private generateTransactionType(type: TransactionType): OrderType {
    switch (type) {
      case 'topup':
        return 'tp';
      case 'payment':
        return 'py';
      case 'refund':
        return 'rf';
      case 'settlement':
        return 'st';
      default:
        return 'unk';
    }
  }

  public generateSignature(
    orderId: string,
    statusCode: string,
    grossAmount: string,
  ) {
    return sha512(
      orderId + statusCode + grossAmount + process.env.MIDTRANS_SERVER_KEY,
    );
  }

  protected generateItemDetails(itemDetail: ItemDetail) {
    const itemDetails: ItemDetail[] = [itemDetail];
    if (itemDetail.price < MINIMUM_FREE_ADMIN)
      itemDetails.push({
        id: ITEM_ID.TRANSACTION_MIDTRANS_FEE,
        price: 4500,
        quantity: 1,
        name: 'Transaction Midtrans Fee',
      });
    return itemDetails;
  }
}
