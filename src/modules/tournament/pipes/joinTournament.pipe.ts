import {
  type ArgumentMetadata,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import { BaseValidation } from 'src/base/validation.base';
import {
  BANK_PROVIDERS,
  EWALLET_PROVIDERS,
} from 'src/constants/transaction.constant';
import * as yup from 'yup';
import type { JointTournamentProps } from '../tournament.interface';

@Injectable()
export class JoinTournamentBodyPipe
  extends BaseValidation
  implements PipeTransform
{
  public async transform(value: any, metadata: ArgumentMetadata) {
    return await this.validate<JointTournamentProps>(
      yup
        .object()
        .shape({
          paymentType: yup
            .string()
            .typeError('paymentType must be a string')
            .oneOf(
              ['wallet', 'transfer', null],
              'paymentType must be wallet or transfer',
            )
            .default(null)
            .nullable()
            .optional(),
          paymentMethod: yup
            .string()
            .typeError('paymentMethod must be a string')
            .oneOf(
              [null, ...EWALLET_PROVIDERS, ...BANK_PROVIDERS],
              'unsupported payment type',
            )
            .default(null)
            .nullable()
            .optional(),
          teamId: yup
            .string()
            .uuid('teamId must be a uuid')
            .required('teamId is required'),
        })
        .test(
          'valid payment',
          'payment method must be provided if payment type is transfer',
          ({ paymentMethod = null, paymentType = null }) =>
            paymentType !== 'transfer' ||
            (paymentType === 'transfer' && !!paymentMethod),
        ),
      value,
    );
  }
}
