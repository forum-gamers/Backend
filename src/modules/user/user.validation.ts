import { Injectable } from '@nestjs/common';
import { BaseValidation } from '../../base/validation.base';
import * as yup from 'yup';
import type { ILoginProps, RegisterInputProps } from './user.interface';

@Injectable()
export class UserValidation extends BaseValidation {
  public validateRegister = async (data: any) =>
    this.validate<RegisterInputProps & { confirmPassword: string }>(
      yup
        .object()
        .shape({
          username: yup
            .string()
            .required('username is required')
            .min(3, 'minimum username character is 3'),
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
}
