import { Injectable } from '@nestjs/common';
import { BaseValidation } from 'src/base/validation.base';
import * as yup from 'yup';
import type { ICreateHistoryProps } from './history.interface';

@Injectable()
export class HistoryValidation extends BaseValidation {
  public validateCreateHistory = async (data: any) =>
    await this.validate<ICreateHistoryProps>(
      yup.object().shape({
        searchedText: yup.string().required('searchedText is required'),
      }),
      data,
    );
}
