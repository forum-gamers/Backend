import { Injectable } from '@nestjs/common';
import { BaseValidation } from 'src/base/validation.base';
import * as yup from 'yup';
import type { SearchQueryProps } from './search.interface';

@Injectable()
export class SearchValidation extends BaseValidation {
  public validateSearchQuery = async (data: any) =>
    await this.validate<SearchQueryProps>(
      yup.object().shape({
        q: yup.string().required('q is required'),
        record: yup
          .boolean()
          .default(false)
          .transform(
            (_, val: string = '') =>
              !!val && ['t', 'true'].includes(val.toLowerCase()),
          )
          .optional(),
      }),
      data,
    );
}
