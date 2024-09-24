import {
  type ArgumentMetadata,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import { BaseValidation } from 'src/base/validation.base';
import * as yup from 'yup';
import type { CreateCommunityEventProps } from '../communityEvent.interface';

@Injectable()
export class CreateCommunityEventPipe
  extends BaseValidation
  implements PipeTransform<any, Promise<CreateCommunityEventProps>>
{
  public async transform(value: any, metadata: ArgumentMetadata) {
    return await this.validate<CreateCommunityEventProps>(
      yup
        .object()
        .shape({
          title: yup
            .string()
            .transform((_, v: string) => v?.trim() || '')
            .min(3, 'at least 3 characters')
            .max(30, 'max 30 characters')
            .required(),
          description: yup
            .string()
            .test(
              'is valid text',
              'description must be between 3 and 160 characters and can only contain letters, numbers, and basic punctuation.',
              (val) =>
                !val || /^(?=.*\S)[a-zA-Z0-9.,!?'"()\-\n ]{3,160}$/.test(val),
            )
            .default(null)
            .nullable()
            .optional(),
          location: yup
            .string()
            .transform((_, v: string) => v?.trim() || '')
            .min(6, 'min 6 characters')
            .max(255, 'max 255 characters')
            .required('location is required'),
          startTime: yup
            .date()
            .min(
              (() => {
                const now = new Date();
                now.setHours(7); //utc+7
                return new Date(now);
              })(),
              'start time must be in the future',
            )
            .required('start time is required'),
          endTime: yup.date().default(null).nullable().optional(),
          isPublic: yup
            .boolean()
            .transform(Boolean)
            .default(true)
            .nullable()
            .optional(),
        })
        .test(
          'is valid date',
          'end time must be after start time',
          ({ startTime, endTime }) => !endTime || startTime < endTime,
        ),
      value,
    );
  }
}
