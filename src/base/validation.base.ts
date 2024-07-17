import { BadRequestException } from '@nestjs/common';
import type {
  BaseQuery,
  ICustomValidateFiles,
} from '../interfaces/request.interface';
import * as yup from 'yup';
import {
  SUPPORTED_IMAGE_TYPE,
  SUPPORTED_VIDEO_TYPE,
} from 'src/constants/global.constant';

export abstract class BaseValidation {
  protected async validate<T = any>(schema: yup.Schema, data: any): Promise<T> {
    try {
      return (await schema.validate(data, {
        stripUnknown: true,
        abortEarly: false,
      })) as T;
    } catch (err) {
      const { errors } = err as { errors: string[] };

      throw new BadRequestException(
        errors.length ? errors.join(',\n ') : (errors[0] ?? 'unexpected error'),
      );
    }
  }

  protected passwordValidation(password: string) {
    const requirements = [
      {
        regex: /(?=.*[a-z])/,
        message: 'password must contain atleast 1 lower case',
      },
      {
        regex: /(?=.*[A-Z])/,
        message: 'password must contain atleast 1 upper case',
      },
      {
        regex: /(?=.*\d)/,
        message: 'password must contain atleast 1 number',
      },
      {
        regex: /(?=.*[!@#$%^&*])/,
        message: 'password must contain atleast 1 symbol',
      },
      {
        regex: /^.{8,}$/,
        message: 'password minimum character must be equal or greater than 8',
      },
    ];
    const errors: string[] = [];

    for (const requirement of requirements)
      if (!requirement.regex.test(password))
        errors.push(new Error(requirement.message).message);

    if (errors.length) throw { errors };

    return true;
  }

  protected yupEmail = yup
    .string()
    .email('invalid email format')
    .required('email is required');

  protected baseQuery = ({
    page = 1,
    limit = 10,
    sortBy = ['createdAt'],
    sortDirection = 'DESC',
  }: BaseQuery) => ({
    page: yup.number().default(page).optional(),
    limit: yup.number().default(limit).optional(),
    sortBy: yup
      .string()
      .oneOf(sortBy, 'invalid sort by')
      .default(sortBy[0])
      .optional(),
    sortDirection: yup
      .string()
      .oneOf(['ASC', 'DESC'], 'invalid sort direction')
      .default(sortDirection)
      .optional(),
  });

  protected validateFiles = ({
    fieldname = yup.string().required('field name is required'),
    originalname = yup.string().required('original name is required'),
    encoding = yup.string().required('encoding is required'),
    size = yup
      .number()
      .max(10 * 1024 * 1024, 'max size 10mb')
      .required('size is required'),
    filename = yup.string().optional(),
    buffer = yup.mixed().required('buffer is required'),
    mimetype = yup
      .string()
      .oneOf(
        [...SUPPORTED_IMAGE_TYPE, ...SUPPORTED_VIDEO_TYPE],
        'unsupported file',
      )
      .required('mimetype is required'),
  }: Partial<ICustomValidateFiles>): ICustomValidateFiles => ({
    fieldname,
    originalname,
    encoding,
    size,
    filename,
    buffer,
    mimetype,
  });
}
