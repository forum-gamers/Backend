import { Injectable } from '@nestjs/common';
import { BaseValidation } from 'src/base/validation.base';
import {
  SUPPORTED_IMAGE_TYPE,
  SUPPORTED_VIDEO_TYPE,
} from 'src/constants/global.constant';
import * as yup from 'yup';
import type {
  IEditTextProps,
  IPostPayloadProps,
  IPostVideoProps,
} from './post.interface';

@Injectable()
export class PostValidation extends BaseValidation {
  public validatePostUploadFiles = async (data: any) =>
    await this.validate<IPostVideoProps>(
      yup.object().shape({
        files: yup
          .array()
          .of(
            yup.object({
              ...this.validateFiles({
                size: yup
                  .number()
                  .when('mimetype', {
                    is: (mimetype: string) =>
                      SUPPORTED_VIDEO_TYPE.includes(mimetype),
                    then: () =>
                      yup
                        .number()
                        .max(10 * 1024 * 1024, 'max 10MB for video file'),
                    otherwise: () =>
                      yup
                        .number()
                        .max(2 * 1024 * 1024, 'max 2MB for image file'),
                  })
                  .required('file size must be provided'),
                mimetype: yup
                  .string()
                  .oneOf(
                    [...SUPPORTED_IMAGE_TYPE, ...SUPPORTED_VIDEO_TYPE],
                    'file type is not supported',
                  )
                  .required('file type must be provided'),
              }),
            }),
          )
          .max(4, 'max 4 files are allowed')
          .required('files must be provided'),
      }),
      data,
    );

  public validateCreatePost = async (data: any, mediaExists: boolean) =>
    await this.validate<IPostPayloadProps>(
      yup.object().shape({
        text: yup
          .string()
          .test(
            'is empty',
            'text is required if media is not provided',
            (value) =>
              (!!value &&
                /^(?=.*\S)[a-zA-Z0-9.,!?'"()\-\n ]{1,2000}$/.test(value)) ||
              (!value && mediaExists),
          ),
        allowComment: yup.boolean().default(true),
        privacy: yup
          .string()
          .oneOf(['public', 'private', 'friend-only'], 'invalid privacy')
          .default('public'),
        communityId: yup.number().optional(),
      }),
      data,
    );

  public validateEditText = async (data: any, defaultValue: string | null) =>
    await this.validate<IEditTextProps>(
      yup.object().shape({
        text: yup
          .string()
          .test(
            'is valid',
            'text is required',
            (value) =>
              !!value &&
              /^(?=.*\S)[a-zA-Z0-9.,!?'"()\-\n ]{1,2000}$/.test(value),
          )
          .nullable()
          .default(defaultValue)
          .optional(),
      }),
      data,
    );

  public validateGetPostQuery = async (data: any) =>
    await this.validate<{ page: number; limit: number }>(
      yup.object().shape({
        page: yup.number().default(1).optional(),
        limit: yup.number().default(15).optional(),
      }),
      data,
    );
}
