import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
  RequestMethod,
} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommunityEvent } from 'src/models/communityevent';
import { CommunityEventService } from './communityEvent.service';
import { CommunityModule } from '../community/community.module';
import { CommunityEventController } from './communityEvent.controller';
import { USER_VERIFIED_MIDDLEWARE } from 'src/constants/global.constant';
import { CommunityMemberModule } from '../communityMember/communityMember.module';
import { CommunityAccessMiddleware } from 'src/middlewares/community/access.middleware';

@Module({
  imports: [
    SequelizeModule.forFeature([CommunityEvent]),
    CommunityModule,
    CommunityMemberModule,
  ],
  providers: [CommunityEventService],
  controllers: [CommunityEventController],
})
export class CommunityEventModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(...USER_VERIFIED_MIDDLEWARE)
      .forRoutes(CommunityEventController)
      .apply(CommunityAccessMiddleware)
      .forRoutes(CommunityEventController);
  }
}
