import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Post } from 'src/models/post';
import { PostService } from './post.service';
import { PostValidation } from './post.validation';
import { PostController } from './post.controller';
import { PostMediaModule } from '../postMedia/postMedia.module';
import { ThirdPartyModule } from 'src/third-party/third-party.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Post]),
    PostMediaModule,
    ThirdPartyModule,
  ],
  providers: [PostService, PostValidation],
  controllers: [PostController],
  exports: [PostService],
})
export class PostModule {}
