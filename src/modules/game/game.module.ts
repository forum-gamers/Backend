import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Game } from 'src/models/game';
import { GameService } from './game.service';
import { GameController } from './game.controller';

@Module({
  imports: [SequelizeModule.forFeature([Game])],
  providers: [GameService],
  exports: [GameService],
  controllers: [GameController],
})
export class GameModule {}
