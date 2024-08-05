import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { USER_VERIFIED_MIDDLEWARE } from 'src/constants/global.constant';

@Module({
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(...USER_VERIFIED_MIDDLEWARE).forRoutes(SearchController);
  }
}
