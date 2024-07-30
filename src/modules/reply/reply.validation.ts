import { Injectable } from '@nestjs/common';
import { BaseValidation } from 'src/base/validation.base';
import * as yup from 'yup';
import type { ICreateReplyProps } from './reply.interface';

@Injectable()
export class ReplyValidation extends BaseValidation {
  public validateCreateReply = async (data: any) =>
    await this.validate<ICreateReplyProps>(
      yup.object().shape({
        text: yup
          .string()
          .min(1, 'text is too short')
          .max(160, 'text is too long')
          .required('text is required'),
      }),
      data,
    );
}
