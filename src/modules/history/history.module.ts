import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SearchHistory } from 'src/models/searchHistory';
import { HistoryService } from './history.service';
import { USER_VERIFIED_MIDDLEWARE } from 'src/constants/global.constant';
import { HistoryController } from './history.controller';
import { HistoryValidation } from './history.validation';

@Module({
  imports: [SequelizeModule.forFeature([SearchHistory])],
  providers: [HistoryService, HistoryValidation],
  exports: [HistoryService],
  controllers: [HistoryController],
})
export class HistoryModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(...USER_VERIFIED_MIDDLEWARE).forRoutes(HistoryController);
  }
}
