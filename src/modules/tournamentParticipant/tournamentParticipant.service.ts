import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CountOptions, CreateOptions, FindOptions } from 'sequelize';
import {
  TournamentParticipant,
  type TournamentParticipantAttributes,
} from 'src/models/tournamentparticipant';
import { CreateTournamentParticipantDto } from './dto/create.dto';

@Injectable()
export class TournamentParticipantService {
  constructor(
    @InjectModel(TournamentParticipant)
    private readonly model: typeof TournamentParticipant,
  ) {}

  public async countParticipant(
    tournamentId: number,
    status: boolean,
    opts?: Omit<CountOptions<TournamentParticipantAttributes>, 'where'>,
  ) {
    return await this.model.count({
      ...opts,
      where: { tournamentId, status },
    });
  }

  public async findByTeamId(
    teamId: string,
    opts?: Omit<FindOptions<TournamentParticipantAttributes>, 'where'>,
  ) {
    return await this.model.findOne({
      ...opts,
      where: { teamId },
    });
  }

  public async create(
    payload: CreateTournamentParticipantDto,
    opts?: CreateOptions<TournamentParticipantAttributes>,
  ) {
    return await this.model.create(payload, opts);
  }

  public async findByTournamentIdAndTeamId(
    tournamentId: number,
    teamId: string,
    opts?: Omit<FindOptions<TournamentParticipantAttributes>, 'where'>,
  ) {
    return await this.model.findOne({
      ...opts,
      where: { tournamentId, teamId },
    });
  }

  public async updateStatus(
    tournamentId: number,
    teamId: string,
    status: boolean,
    opts?: Omit<CreateOptions<TournamentParticipantAttributes>, 'where'>,
  ) {
    return await this.model.update(
      { status },
      { ...opts, where: { tournamentId, teamId } },
    );
  }
}
