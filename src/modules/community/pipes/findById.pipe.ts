import {
  type ArgumentMetadata,
  BadRequestException,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import { CommunityService } from '../community.service';

@Injectable()
export class CommunityFindByIdPipe implements PipeTransform {
  public async transform(value: string, metadata: ArgumentMetadata) {
    let id = parseInt(value);
    if (isNaN(id)) throw new BadRequestException('id must be a number');

    return await this.communityService.findById(id);
  }

  constructor(private readonly communityService: CommunityService) {}
}
