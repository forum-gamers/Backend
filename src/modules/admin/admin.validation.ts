import { Injectable } from '@nestjs/common';
import { BaseValidation } from 'src/base/validation.base';
import * as yup from 'yup';
import type { LoginProps } from './admin.interface';

@Injectable()
export class AdminValidation extends BaseValidation {
  public validateLogin = async (data: any) =>
    await this.validate<LoginProps>(
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
