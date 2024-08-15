import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Game } from 'src/models/game';
import { GameService } from './game.service';

@Module({
  imports: [SequelizeModule.forFeature([Game])],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}
