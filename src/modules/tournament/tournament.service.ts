import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Tournament, type TournamentAttributes } from 'src/models/tournament';
import { CreateTournamentDto } from './dto/create.dto';
import {
  type FindOptions,
  Op,
  type UpdateOptions,
  type CreateOptions,
} from 'sequelize';

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

  public async findById(id: number, opts?: FindOptions<TournamentAttributes>) {
    return await this.model.findByPk(id, opts);
  }

  public async updateMoneyPool(
    id: number,
    moneyPool: number,
    opts?: Omit<UpdateOptions<TournamentAttributes>, 'where'>,
  ) {
    return this.model.update({ moneyPool }, { ...opts, where: { id } });
  }
}
