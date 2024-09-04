import {
  type ArgumentMetadata,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import { UserService } from '../user.service';

@Injectable()
export class FindUserProfile implements PipeTransform {
  public async transform(value: string, metadata: ArgumentMetadata) {
    return await this.userService.findUserProfile(value);
  }

  constructor(private readonly userService: UserService) {}
}
