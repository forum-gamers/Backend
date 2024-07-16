import {
  type ArgumentMetadata,
  BadRequestException,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import { CommentService } from '../comment.service';

@Injectable()
export class CommentFindByIdPipe implements PipeTransform {
  public async transform(value: string, metadata: ArgumentMetadata) {
    let id = parseInt(value);
    if (isNaN(id)) throw new BadRequestException('id must be a number');

    return await this.commentService.findById(id);
  }

  constructor(private readonly commentService: CommentService) {}
}
