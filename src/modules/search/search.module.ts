import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { USER_VERIFIED_MIDDLEWARE } from 'src/constants/global.constant';
import { HistoryModule } from '../history/history.module';
import { SearchValidation } from './search.validation';

@Module({
  imports: [HistoryModule],
  providers: [SearchService, SearchValidation],
  controllers: [SearchController],
})
export class SearchModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(...USER_VERIFIED_MIDDLEWARE).forRoutes(SearchController);
  }
}
