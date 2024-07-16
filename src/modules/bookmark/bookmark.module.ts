import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PostBookmark } from 'src/models/postbookmark';
import { PostModule } from '../post/post.module';
import { BookmarkService } from './bookmark.service';
import { BookmarkController } from './bookmark.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([PostBookmark]),
    forwardRef(() => PostModule),
  ],
  providers: [BookmarkService],
  controllers: [BookmarkController],
  exports: [BookmarkService],
})
export class BookmarkModule {}
