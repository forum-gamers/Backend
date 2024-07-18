import { Injectable } from '@nestjs/common';
import { BaseValidation } from 'src/base/validation.base';
import * as yup from 'yup';
import type { CreateRoomInputBody, IFileProps } from './roomChat.interface';
import { SUPPORTED_IMAGE_TYPE } from 'src/constants/global.constant';

@Injectable()
export class RoomChatValidation extends BaseValidation {
  public validateCreateRoom = async (data: any, ownerId: string) =>
    await this.validate<CreateRoomInputBody>(
      yup.object().shape({
        users: yup
          .array()
          .of(yup.string().required('user is required'))
          .min(2, 'minimum input is 2 (include yourself)')
          .max(300, 'maximum input is 300')
          .transform((val: string | string[]) =>
            Array.from(
              new Set<string>([
                ownerId,
                ...(typeof val === 'string' ? val.split(',') : val),
              ]),
            ),
          )
          .required('users is required'),
        description: yup
          .string()
          .test(
            'is valid',
            'description must be between 3 and 160 characters and can only contain letters, numbers, and basic punctuation.',
            (val) =>
              !val || /^(?=.*\S)[a-zA-Z0-9.,!?'"()\-\n ]{3,160}$/.test(val),
          )
          .optional(),
        name: yup.string().when('users', {
          is: (users: string[] | string) =>
            Array.isArray(users)
              ? users.length > 2
              : users.split(',').length > 2,
          then: () =>
            yup
              .string()
              .required('name is required if users length is more than 2'),
          otherwise: () => yup.string().optional(),
        }),
      }),
      data,
    );

  public validateCreateRoomChatImage = async (data: any) =>
    await this.validate<IFileProps>(
      yup.object().shape({
        file: yup.object({
          ...this.validateFiles({
            size: yup
              .number()
              .max(2 * 1024 * 1024, 'max size 2mb')
              .required('size is required'),
            mimetype: yup
              .string()
              .oneOf(SUPPORTED_IMAGE_TYPE, 'unsupported file type')
              .required('mimetype is required'),
          }),
        }),
      }),
      data,
    );
}
