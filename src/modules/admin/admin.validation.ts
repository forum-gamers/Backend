import { Injectable } from '@nestjs/common';
import { BaseValidation } from 'src/base/validation.base';
import * as yup from 'yup';
import type {
  BlockProps,
  IRegisterAdminProps,
  LoginProps,
} from './admin.interface';

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

  public validateCreateAdmin = async (data: any) =>
    await this.validate<IRegisterAdminProps>(
      yup.object().shape({
        email: yup
          .string()
          .email('invalid email format')
          .required('email is required'),
        password: yup.string().required('password is required'),
        fullname: yup.string().required('fullname is required'),
        division: yup
          .string()
          .oneOf(
            [
              'Director',
              'Finance',
              'IT',
              'Third Party',
              'Customer Service',
              'Marketing',
            ],
            'invalid division',
          )
          .required('division is required'),
        role: yup
          .string()
          .oneOf(['Supervisor', 'Manager', 'Staff'], 'invalid role')
          .required('role is required'),
      }),
      data,
    );

  public validateBlock = async (data: any) =>
    await this.validate<BlockProps>(
      yup.object().shape({
        reason: yup
          .string()
          .min(5, 'reason is too short')
          .required('reason is required'),
      }),
      data,
    );
}
