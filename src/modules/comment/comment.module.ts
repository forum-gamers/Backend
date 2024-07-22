import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PostComment } from 'src/models/postcomment';
import { PostModule } from '../post/post.module';
import { CommentService } from './comment.service';
import { CommentValidation } from './comment.validation';
import { CommentController } from './comment.controller';
import { ReplyModule } from '../reply/reply.module';
import { UserPreferenceModule } from '../userPreference/userPreference.module';

@Module({
  imports: [
    SequelizeModule.forFeature([PostComment]),
    forwardRef(() => PostModule),
    ReplyModule,
    UserPreferenceModule,
  ],
  providers: [CommentService, CommentValidation],
  controllers: [CommentController],
  exports: [CommentService],
})
export class CommentModule {}
