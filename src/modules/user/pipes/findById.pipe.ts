import {
  type ArgumentMetadata,
  BadRequestException,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import { UserService } from '../user.service';
import globalUtils from '../../../utils/global.utils';

@Injectable()
export class UserFindById implements PipeTransform {
  public transform(value: string, metadata: ArgumentMetadata) {
    if (!globalUtils.isValidUUID(value))
      throw new BadRequestException('invalid uuid');

    return this.userService.findOneById(value);
  }

  constructor(private readonly userService: UserService) {}
}
