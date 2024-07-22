import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PostLike } from 'src/models/postlike';
import { PostModule } from '../post/post.module';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { UserPreferenceModule } from '../userPreference/userPreference.module';

@Module({
  imports: [
    SequelizeModule.forFeature([PostLike]),
    forwardRef(() => PostModule),
    UserPreferenceModule,
  ],
  providers: [LikeService],
  controllers: [LikeController],
  exports: [LikeService],
})
export class LikeModule {}
