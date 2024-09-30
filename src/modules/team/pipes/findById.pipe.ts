import {
  type ArgumentMetadata,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import { TeamService } from '../team.service';

@Injectable()
export class TeamFindById implements PipeTransform {
  public async transform(value: string, metadata: ArgumentMetadata) {
    return await this.teamService.findById(value);
  }

  constructor(private readonly teamService: TeamService) {}
}
