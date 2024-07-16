import {
  type ArgumentMetadata,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import { UserService } from '../user.service';
import jwt from '../../../utils/global/jwt.utils';

@Injectable()
export class UserFindByTokenPipe implements PipeTransform {
  constructor(private readonly userService: UserService) {}

  public transform(value: string, metadata: ArgumentMetadata) {
    const { id } = jwt.verifyToken(value);

    return this.userService.findOneById(id);
  }
}
