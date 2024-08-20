import type { TransactionType } from 'src/interfaces/transaction.interface';
import { v4 } from 'uuid';

export class MidtransHelper {
  protected generateTransactionId(type: TransactionType) {
    return `FG-${v4()}-${this.generateTransactionType(type)}`;
  }

  private generateTransactionType(type: TransactionType) {
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
}
