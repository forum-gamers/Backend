import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { GameService } from '../game.service';

@Injectable()
export class GameFindById implements PipeTransform {
  public async transform(value: number, metadata: ArgumentMetadata) {
    return await this.gameService.findById(value);
  }

  constructor(private readonly gameService: GameService) {}
}
