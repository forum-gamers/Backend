import {
  forwardRef,
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PostBookmark } from 'src/models/postbookmark';
import { PostModule } from '../post/post.module';
import { BookmarkService } from './bookmark.service';
import { BookmarkController } from './bookmark.controller';
import { USER_VERIFIED_MIDDLEWARE } from 'src/constants/global.constant';

@Module({
  imports: [
    SequelizeModule.forFeature([PostBookmark]),
    forwardRef(() => PostModule),
  ],
  providers: [BookmarkService],
  controllers: [BookmarkController],
  exports: [BookmarkService],
})
export class BookmarkModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(...USER_VERIFIED_MIDDLEWARE).forRoutes(BookmarkController);
  }
}
