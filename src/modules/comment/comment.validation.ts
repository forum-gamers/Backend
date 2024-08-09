import { Injectable } from '@nestjs/common';
import { BaseValidation } from 'src/base/validation.base';
import type { ICreateCommentProps } from './comment.interface';
import * as yup from 'yup';
import { QueryParamsDto } from 'src/utils/dto/pagination.dto';

@Injectable()
export class CommentValidation extends BaseValidation {
  public validateCreateComment = async (data: any) =>
    await this.validate<ICreateCommentProps>(
      yup.object().shape({
        text: yup
          .string()
          .min(1, 'text is too short')
          .max(160, 'text is too long')
          .required('text is required'),
      }),
      data,
    );

  public validateQuery = async (data: any) =>
    await this.validate<QueryParamsDto>(
      yup.object().shape({
        ...this.baseQuery({}),
      }),
      data,
    );
}
