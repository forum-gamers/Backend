import {
  type ArgumentMetadata,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import { BaseValidation } from 'src/base/validation.base';
import * as yup from 'yup';
import type { CreateTournamentBodyProps } from '../tournament.interface';
import {
  BANK_PROVIDERS,
  EWALLET_PROVIDERS,
} from 'src/constants/transaction.constant';

@Injectable()
export class CreateTournamentPipe
  extends BaseValidation
  implements PipeTransform<any, Promise<CreateTournamentBodyProps>>
{
  public async transform(value: any, metadata: ArgumentMetadata) {
    return await this.validate<CreateTournamentBodyProps>(
      yup
        .object()
        .shape({
          name: yup
            .string()
            .typeError('name must be a string')
            .trim()
            .required('name is required'),
          gameId: yup
            .number()
            .typeError('gameId must be a number')
            .required('gameId is required'),
          description: yup
            .string()
            .transform((_, val?: string) => (!val ? null : val.trim()))
            .trim()
            .default(null)
            .nullable()
            .optional(),
          pricePool: yup
            .number()
            .typeError('pricePool must be a number')
            .min(0, 'pricePool must be greater than 0')
            .required('pricePool is required'),
          slot: yup
            .number()
            .typeError('slot must be a number')
            .test('valid slot', 'slot must be even', (val) => val % 2 === 0)
            .max(5000, 'slot must be less than 5000')
            .min(0, 'pricePool must be greater than 0')
            .required('slot is required'),
          startDate: yup
            .date()
            .typeError('startDate must be a date')
            .test(
              'startDate minimum',
              'startDate is must be greater than now',
              (val) => new Date(val) > new Date(),
            )
            .transform((val) => new Date(val))
            .required('startDate is required'),
          registrationFee: yup
            .number()
            .typeError('registrationFee must be a number')
            .min(0, 'registrationFee must be greater than 0')
            .required('registrationFee is required'),
          location: yup
            .string()
            .typeError('location must be a string')
            .trim()
            .required('location is required'),
          tags: yup
            .array()
            .typeError('tags must be an array')
            .of(yup.string().required('tags is required'))
            .transform((val) =>
              typeof val === 'string' ? val.split(',') : val,
            )
            .required('tags is required'),
          communityId: yup
            .number()
            .typeError('communityId must be a number')
            .test(
              'is valid',
              'communityId must be a number',
              (val) => !val || typeof val === 'number' || !isNaN(val),
            )
            .transform((val) => (val ? Number(val) : null))
            .default(null)
            .nullable()
            .optional(),
          isPublic: yup
            .bool()
            .typeError('isPublic must be a boolean')
            .default(true)
            .nullable()
            .optional(),
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
