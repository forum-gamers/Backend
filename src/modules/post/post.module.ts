import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Post } from 'src/models/post';
import { PostService } from './post.service';
import { PostValidation } from './post.validation';
import { PostController } from './post.controller';
import { PostMediaModule } from '../postMedia/postMedia.module';
import { ThirdPartyModule } from 'src/third-party/third-party.module';
import { LikeModule } from '../like/like.module';
import { BookmarkModule } from '../bookmark/bookmark.module';
import { CommentModule } from '../comment/comment.module';
import { ReplyModule } from '../reply/reply.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Post]),
    PostMediaModule,
    ThirdPartyModule,
    forwardRef(() => LikeModule),
    forwardRef(() => BookmarkModule),
    forwardRef(() => CommentModule),
    ReplyModule,
  ],
  providers: [PostService, PostValidation],
  controllers: [PostController],
  exports: [PostService],
})
export class PostModule {}