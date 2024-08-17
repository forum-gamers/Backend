import {
  type ArgumentMetadata,
  BadRequestException,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import { BaseValidation } from 'src/base/validation.base';
import { ICustomValidateFiles } from 'src/interfaces/request.interface';
import * as yup from 'yup';

export type FileValidationOptions = Pick<
  ICustomValidateFiles,
  'mimetype' | 'size'
> &
  Partial<Omit<ICustomValidateFiles, 'mimetype' | 'size'>> & {
    required?: {
      value: boolean;
      errorMessage?: string;
    };
  };

@Injectable()
export class FileValidationPipe
  extends BaseValidation
  implements PipeTransform
{
  private readonly opts: FileValidationOptions;

  public async transform(value: any, metadata: ArgumentMetadata) {
    const { required = null } = this.opts;

    if (required?.value && !value)
      throw new BadRequestException(
        required?.errorMessage ?? 'file is required',
      );

    return !!value
      ? await this.validate(
          yup.object().shape({
            ...this.validateFiles(this.opts),
          }),
          value,
        )
      : null;
  }

  constructor(opts: FileValidationOptions) {
    super();
    this.opts = opts;
  }
}
