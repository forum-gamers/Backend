import { Injectable } from '@nestjs/common';
import { BaseValidation } from 'src/base/validation.base';
import { QueryParamsDto } from 'src/utils/dto/pagination.dto';
import * as yup from 'yup';

@Injectable()
export class FollowValidation extends BaseValidation {
  public validatePagination = async (data: any) =>
    await this.validate<QueryParamsDto>(
      yup.object().shape(
        this.baseQuery({
          sortBy: ['createdAt', 'followerId', 'followedId'],
        }),
      ),
      data,
    );
}
