import {
  type ArgumentMetadata,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import { TournamentService } from '../tournament.service';
import { Transaction } from 'sequelize';

@Injectable()
export class TournamentFindByIdLockedPipe implements PipeTransform {
  public async transform(value: number, metadata: ArgumentMetadata) {
    return await this.tournamentService.findById(value, {
      lock: Transaction.LOCK.UPDATE,
    });
  }

  constructor(private readonly tournamentService: TournamentService) {}
}
