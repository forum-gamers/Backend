import { Injectable } from '@nestjs/common';
import { BaseValidation } from 'src/base/validation.base';
import {
  BANK_PROVIDERS,
  EWALLET_PROVIDERS,
} from 'src/constants/transaction.constant';
import * as yup from 'yup';
import type { TopupProps } from './transaction.interface';

@Injectable()
export class TransactionValidation extends BaseValidation {
  public validateTopup = async (data: any) =>
    await this.validate<TopupProps>(
      yup.object().shape({
        amount: yup
          .number()
          .min(10_000, 'min amount is Rp.10_000')
          .max(10_000_000, 'max amount is Rp.10_000_000')
          .required('amount is required'),
        paymentType: yup
          .string()
          .oneOf(
            [...EWALLET_PROVIDERS, ...BANK_PROVIDERS],
            'unsupported payment type',
          )
          .required('payment type is required'),
      }),
      data,
    );
}
