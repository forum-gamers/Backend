import { Injectable } from '@nestjs/common';
import { BaseValidation } from 'src/base/validation.base';
import * as yup from 'yup';
import type { UpdateReadProps } from './ws.interface';

@Injectable()
export class WsValidation extends BaseValidation {
  public validateUpdateReadStatus = async (data: any) =>
    await this.validate<UpdateReadProps>(
      yup.object().shape({
        chatIds: yup
          .array()
          .of(yup.number())
          .min(1, 'chatIds is required')
          .max(300, 'maximum input is 300')
          .required('chatIds is required'),
        roomId: yup.number().required('roomId is required'),
      }),
      data,
    );
}
