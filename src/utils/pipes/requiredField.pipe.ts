import {
  type ArgumentMetadata,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import { BaseValidation } from '../../base/validation.base';
import * as yup from 'yup';

@Injectable()
export class RequiredField<T>
  extends BaseValidation
  implements PipeTransform<any, Promise<T>>
{
  public async transform(
    value: string | number | boolean,
    metadata: ArgumentMetadata,
  ) {
    return (
      await this.validate(
        yup.object().shape({
          [metadata.data]: yup
            .mixed()
            .nonNullable(`${metadata.data} is not allowed to be null`)
            .required(`${metadata.data} is required`),
        }),
        { [metadata.data]: value },
      )
    )[metadata.data];
  }
}
