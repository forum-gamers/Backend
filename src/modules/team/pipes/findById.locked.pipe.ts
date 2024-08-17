import {
  type ArgumentMetadata,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import { TeamService } from '../team.service';
import { Transaction } from 'sequelize';

@Injectable()
export class TeamFindByIdLocked implements PipeTransform {
  public async transform(value: any, metadata: ArgumentMetadata) {
    return await this.teamService.findById(value, {
      lock: Transaction.LOCK.UPDATE,
    });
  }

  constructor(private readonly teamService: TeamService) {}
}
