import { Injectable } from '@nestjs/common';
import { BaseValidation } from '../../base/validation.base';
import * as yup from 'yup';
import type {
  ChangePasswordProps,
  EditBioProps,
  IChangeImage,
  IChangeImageQuery,
  ILoginProps,
  IResendEmailProps,
  LangQueryAccept,
  RegisterInputProps,
} from './user.interface';
import { SUPPORTED_IMAGE_TYPE } from '../../constants/global.constant';

@Injectable()
export class UserValidation extends BaseValidation {
  public validateRegister = async (data: any) =>
    this.validate<RegisterInputProps & { confirmPassword: string }>(
      yup
        .object()
        .shape({
          username: yup
            .string()
            .transform((val: string) => val.trim().replace(' ', '-'))
            .min(3, 'minimum username character is 3')
            .max(20, 'maximum username character is 20')
            .required('username is required'),
          email: yup
            .string()
            .required('email is required')
            .email('invalid email format'),
          password: yup
            .string()
            .required('password is required')
            .test((val) => this.passwordValidation(val)),
          confirmPassword: yup.string().required('confirmPassword is required'),
          phoneNumber: yup.string().required('phoneNumber is required'),
        })
        .test(
          'is same',
          'password and confirm password must equal',
          ({ password, confirmPassword }) => confirmPassword === password,
        ),
      data,
    );

  public validateLogin = async (data: any) =>
    await this.validate<ILoginProps>(
      yup.object().shape({
        email: yup
          .string()
          .email('invalid email format')
          .required('email is required'),
        password: yup.string().required('password is required'),
      }),
      data,
    );

  public validateResendEmail = async (data: any) =>
    await this.validate<IResendEmailProps>(
      yup.object().shape({
        email: yup
          .string()
          .email('invalid email format')
          .required('email is required'),
      }),
      data,
    );

  public validateChangeImageQuery = async (data: any) =>
    await this.validate<IChangeImageQuery>(
      yup.object().shape({
        field: yup
          .string()
          .oneOf(
            ['profile', 'background'],
            'field must be profile or background',
          )
          .required('field is required'),
      }),
      data,
    );

  public validateProfileImage = async (data: any) =>
    await this.validate<IChangeImage>(
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

  public validateBio = async (data: any) =>
    await this.validate<EditBioProps>(
      yup.object().shape({
        bio: yup
          .string()
          .test(
            'is valid text',
            'Bio must be between 0 and 160 characters and can only contain letters, numbers, and basic punctuation.',
            (val) => /^(?=.*\S)[a-zA-Z0-9.,!?'"()\-\n ]{0,160}$/.test(val),
          )
          .required('bio is required'),
      }),
      data,
    );

  public validateLangQuery = async (data: any) =>
    await this.validate<LangQueryAccept>(
      yup.object().shape({
        lang: yup
          .string()
          .oneOf(['en', 'id'], 'lang must be en or id')
          .default('en')
          .nullable()
          .optional(),
      }),
      data,
    );

  public validateChangePassword = async (data: any) =>
    await this.validate<ChangePasswordProps>(
      yup
        .object()
        .shape({
          password: yup
            .string()
            .required('password is required')
            .test((val) => this.passwordValidation(val)),
          confirmPassword: yup.string().required('confirmPassword is required'),
        })
        .test(
          'is same',
          'password and confirm password must equal',
          ({ password, confirmPassword }) => confirmPassword === password,
        ),
      data,
    );
}
