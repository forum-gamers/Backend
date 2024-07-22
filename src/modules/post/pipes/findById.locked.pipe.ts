import {
  type ArgumentMetadata,
  BadRequestException,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import { PostService } from '../post.service';
import { Transaction } from 'sequelize';

@Injectable()
export class PostLockedFindByIdPipe implements PipeTransform {
  public async transform(value: string, metadata: ArgumentMetadata) {
    let id = parseInt(value);
    if (isNaN(id)) throw new BadRequestException('id must be a number');

    return await this.postService.findById(id, {
      lock: Transaction.LOCK.UPDATE,
    });
  }

  constructor(private readonly postService: PostService) {}
}
