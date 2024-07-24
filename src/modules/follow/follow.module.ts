import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Follow } from 'src/models/follow';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { FollowValidation } from './follow.validation';
import { USER_VERIFIED_MIDDLEWARE } from 'src/constants/global.constant';

@Module({
  imports: [SequelizeModule.forFeature([Follow])],
  providers: [FollowService, FollowValidation],
  controllers: [FollowController],
})
export class FollowModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(...USER_VERIFIED_MIDDLEWARE).forRoutes(FollowController);
  }
}
