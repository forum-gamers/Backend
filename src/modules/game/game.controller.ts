import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { BaseController } from 'src/base/controller.base';
import { GameService } from './game.service';
import { NotNaN } from 'src/utils/pipes/notNaN.pipe';
import { GameFindById } from './pipes/findById.pipe';
import { type GameAttributes } from 'src/models/game';

@Controller('game')
export class GameController extends BaseController {
  constructor(private readonly gameService: GameService) {
    super();
  }

  @Get()
  @HttpCode(200)
  public async findAll() {
    return this.sendResponseBody({
      message: `game fetched successfully`,
      code: 200,
      data: await this.gameService.findAll(),
    });
  }

  @Get(':id')
  @HttpCode(200)
  public findById(
    @Param('id', NotNaN, ParseIntPipe, GameFindById)
    game: GameAttributes | null,
  ) {
    if (!game) throw new NotFoundException('game not found');

    return this.sendResponseBody({
      message: `game fetched successfully`,
      code: 200,
      data: game,
    });
  }
}
