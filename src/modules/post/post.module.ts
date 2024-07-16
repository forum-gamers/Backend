import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Post } from 'src/models/post';
import { PostService } from './post.service';
import { PostValidation } from './post.validation';
import { PostController } from './post.controller';
import { UserAuthentication } from 'src/middlewares/user/authentication.middleware';
import { UserModule } from '../user/user.module';
import { PostMediaModule } from '../postMedia/postMedia.module';
import { ThirdPartyModule } from 'src/third-party/third-party.module';
import { VerifiedMiddleware } from 'src/middlewares/user/verified.middleware';

@Module({
  imports: [
    SequelizeModule.forFeature([Post]),
    UserModule,
    PostMediaModule,
    ThirdPartyModule,
  ],
  providers: [PostService, PostValidation],
  controllers: [PostController],
})
export class PostModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserAuthentication)
      .forRoutes(PostController)
      .apply(VerifiedMiddleware)
      .forRoutes(PostController);
  }
}
