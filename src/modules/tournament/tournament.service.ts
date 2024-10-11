import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Tournament, type TournamentAttributes } from 'src/models/tournament';
import { CreateTournamentDto } from './dto/create.dto';
import { FindOptions, Op, type CreateOptions } from 'sequelize';

@Injectable()
export class TournamentService {
  constructor(
    @InjectModel(Tournament)
    private readonly model: typeof Tournament,
  ) {}

  public async create(
    payload: CreateTournamentDto,
    opts?: CreateOptions<TournamentAttributes>,
  ) {
    return await this.model.create(payload, opts);
  }

  public async findActiveTourByCommunityId(
    communityId: number,
    gameId: number,
    opts?: Omit<FindOptions<TournamentAttributes>, 'where'>,
  ) {
    return await this.model.findAll({
      ...opts,
      where: {
        communityId,
        status: { [Op.or]: ['started', 'preparation'] },
        gameId,
      },
    });
  }

  public async findActiveTourByUserId(
    userId: string,
    gameId: number,
    opts?: Omit<FindOptions<TournamentAttributes>, 'where'>,
  ) {
    return await this.model.findAll({
      ...opts,
      where: {
        communityId: null,
        userId,
        gameId,
        status: { [Op.or]: ['started', 'preparation'] },
      },
    });
  }
}
