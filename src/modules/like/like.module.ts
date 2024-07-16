import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PostLike } from 'src/models/postlike';
import { PostModule } from '../post/post.module';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([PostLike]),
    forwardRef(() => PostModule),
  ],
  providers: [LikeService],
  controllers: [LikeController],
  exports: [LikeService],
})
export class LikeModule {}
