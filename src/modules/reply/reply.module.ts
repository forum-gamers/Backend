import {
  forwardRef,
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ReplyComment } from 'src/models/replycomment';
import { ReplyService } from './reply.service';
import { ReplyController } from './reply.controller';
import { USER_VERIFIED_MIDDLEWARE } from 'src/constants/global.constant';
import { CommentModule } from '../comment/comment.module';
import { ReplyValidation } from './reply.validation';
import { PostModule } from '../post/post.module';
import { UserPreferenceModule } from '../userPreference/userPreference.module';

@Module({
  imports: [
    SequelizeModule.forFeature([ReplyComment]),
    forwardRef(() => CommentModule),
    forwardRef(() => PostModule),
    UserPreferenceModule,
  ],
  providers: [ReplyService, ReplyValidation],
  exports: [ReplyService],
  controllers: [ReplyController],
})
export class ReplyModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(...USER_VERIFIED_MIDDLEWARE).forRoutes(ReplyController);
  }
}
