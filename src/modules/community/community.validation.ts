import { Injectable } from '@nestjs/common';
import { BaseValidation } from 'src/base/validation.base';
import * as yup from 'yup';
import type {
  ICreateCommunityProps,
  IFileProps,
  UpdateCommunityBodyProps,
} from './community.interface';
import { SUPPORTED_IMAGE_TYPE } from 'src/constants/global.constant';

@Injectable()
export class CommunityValidation extends BaseValidation {
  public validateCreate = async (data: any) =>
    await this.validate<ICreateCommunityProps>(
      yup
        .object()
        .shape({
          name: yup
            .string()
            .min(3, 'name must be at least 3 characters')
            .max(30, 'name must be at most 30 characters')
            .nullable()
            .optional(),
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
          discordServerId: yup.string().optional(),
        })
        .test(
          'required one of',
          'one of discord server id or discord server name is required',
          ({ discordServerId, name }) => !!discordServerId || !!name,
        ),
      data,
    );

  public validateCreateCommunityImage = async (data: any) =>
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

  public validatePaginationQuery = async (data: any) =>
    await this.validate<{ page: number; limit: number }>(
      yup.object().shape({
        page: yup.number().default(1).optional(),
        limit: yup.number().default(15).optional(),
      }),
      data,
    );

  public validateUpdateCommunity = async (
    data: any,
    defaultValue: UpdateCommunityBodyProps,
  ) =>
    await this.validate<UpdateCommunityBodyProps>(
      yup.object().shape({
        name: yup
          .string()
          .transform((_, v: string) => v?.trim() || '')
          .min(3, 'name must be at least 3 characters')
          .max(30, 'name must be at most 30 characters')
          .default(defaultValue.name)
          .optional(),
        description: yup
          .string()
          .transform((_, v: string) => v?.trim() || '')
          .test(
            'is valid text',
            'description must be between 3 and 160 characters and can only contain letters, numbers, and basic punctuation.',
            (val) =>
              !val || /^(?=.*\S)[a-zA-Z0-9.,!?'"()\-\n ]{3,160}$/.test(val),
          )
          .default(defaultValue.description)
          .nullable()
          .optional(),
      }),
      data,
    );
}
