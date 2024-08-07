import {
  type ArgumentMetadata,
  BadRequestException,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import { PostService } from '../post.service';

@Injectable()
export class PostFindByIdPipe implements PipeTransform {
  public async transform(value: string, metadata: ArgumentMetadata) {
    let id = parseInt(value);
    if (isNaN(id)) throw new BadRequestException('id must be a number');

    return await this.postService.findById(id);
  }

  constructor(private readonly postService: PostService) {}
}
