import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PostShare } from 'src/models/postshare';
import { PostShareService } from './postShare.service';
import { PostShareController } from './postShare.controller';
import { PostModule } from '../post/post.module';
import { UserPreferenceModule } from '../userPreference/userPreference.module';
import { USER_VERIFIED_MIDDLEWARE } from 'src/constants/global.constant';

@Module({
  imports: [
    SequelizeModule.forFeature([PostShare]),
    PostModule,
    UserPreferenceModule,
  ],
  providers: [PostShareService],
  controllers: [PostShareController],
})
export class PostShareModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(...USER_VERIFIED_MIDDLEWARE).forRoutes(PostShareController);
  }
}
