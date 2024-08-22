import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { type FindOptions } from 'sequelize';
import { Game, type GameAttributes } from 'src/models/game';

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Game)
    private readonly gameModel: typeof Game,
  ) {}

  public async findAll() {
    return await this.gameModel.findAll();
  }

  public async findById(
    id: number,
    opts?: Omit<FindOptions<GameAttributes>, 'where'>,
  ) {
    return await this.gameModel.findByPk(id, opts);
  }
}
