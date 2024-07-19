import { Injectable } from '@nestjs/common';
import { BaseValidation } from 'src/base/validation.base';
import * as yup from 'yup';
import type { ICreateChatBody, IFileProps } from './chat.interface';
import {
  SUPPORTED_IMAGE_TYPE,
  SUPPORTED_VIDEO_TYPE,
} from 'src/constants/global.constant';

@Injectable()
export class ChatValidation extends BaseValidation {
  public createChatValidation = async (data: any) =>
    await this.validate<ICreateChatBody>(
      yup.object().shape({
        message: yup
          .string()
          .test(
            'is valid',
            'message must be between 3 and 160 characters and can only contain letters, numbers, and basic punctuation.',
            (val) =>
              !val || /^(?=.*\S)[a-zA-Z0-9.,!?'"()\-\n ]{3,160}$/.test(val),
          )
          .nullable()
          .optional(),
      }),
      data,
    );

  public validateChatImage = async (data: any) =>
    await this.validate<IFileProps>(
      yup.object().shape({
        file: yup.object({
          ...this.validateFiles({
            size: yup
              .number()
              .max(10 * 1024 * 1024, 'max size 10mb')
              .required('size is required'),
            mimetype: yup
              .string()
              .oneOf(
                [
                  ...SUPPORTED_IMAGE_TYPE,
                  ...SUPPORTED_VIDEO_TYPE,
                  'application/pdf',
                ],
                'unsupported file type',
              )
              .required('mimetype is required'),
          }),
        }),
      }),
      data,
    );
}
