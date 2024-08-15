import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Game } from 'src/models/game';

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Game)
    private readonly gameModel: typeof Game,
  ) {}

  public async findAll() {
    return await this.gameModel.findAll();
  }
}
