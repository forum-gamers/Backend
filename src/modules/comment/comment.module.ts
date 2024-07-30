import {
  forwardRef,
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PostComment } from 'src/models/postcomment';
import { PostModule } from '../post/post.module';
import { CommentService } from './comment.service';
import { CommentValidation } from './comment.validation';
import { CommentController } from './comment.controller';
import { ReplyModule } from '../reply/reply.module';
import { UserPreferenceModule } from '../userPreference/userPreference.module';
import { USER_VERIFIED_MIDDLEWARE } from 'src/constants/global.constant';

@Module({
  imports: [
    SequelizeModule.forFeature([PostComment]),
    forwardRef(() => PostModule),
    forwardRef(() => ReplyModule),
    UserPreferenceModule,
  ],
  providers: [CommentService, CommentValidation],
  controllers: [CommentController],
  exports: [CommentService],
})
export class CommentModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(...USER_VERIFIED_MIDDLEWARE).forRoutes(CommentController);
  }
}
