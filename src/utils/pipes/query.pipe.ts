import {
  type ArgumentMetadata,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import { BaseValidation } from '../../base/validation.base';
import * as yup from 'yup';

@Injectable()
export class QueryPipe extends BaseValidation implements PipeTransform {
  private readonly schema: any;
  private readonly page: number;
  private readonly limit: number;

  public async transform(value: any, metadata: ArgumentMetadata) {
    return await this.validate(
      yup.object().shape({
        ...this.baseQuery({ page: this.page, limit: this.limit }),
        ...this.schema,
      }),
      value,
    );
  }

  constructor(page: number, limit: number, schema: object = {}) {
    super();
    this.page = page;
    this.limit = limit;
    this.schema = schema;
  }
}
