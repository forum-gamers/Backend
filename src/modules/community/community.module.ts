import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
  RequestMethod,
} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Community } from 'src/models/community';
import { CommunityService } from './community.service';
import { CommunityValidation } from './community.validation';
import { CommunityController } from './community.controller';
import { ThirdPartyModule } from 'src/third-party/third-party.module';
import { CommunityMemberModule } from '../communityMember/communityMember.module';
import { CommunityAccessMiddleware } from 'src/middlewares/community/access.middleware';
import { USER_VERIFIED_MIDDLEWARE } from 'src/constants/global.constant';
import { DiscordModule } from '../discord/discord.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Community]),
    ThirdPartyModule,
    CommunityMemberModule,
    DiscordModule,
  ],
  providers: [CommunityService, CommunityValidation],
  controllers: [CommunityController],
  exports: [CommunityService],
})
export class CommunityModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(...USER_VERIFIED_MIDDLEWARE)
      .forRoutes(CommunityController)
      .apply(CommunityAccessMiddleware)
      .forRoutes(
        { path: '/community/:id', method: RequestMethod.DELETE },
        { path: '/community/:id', method: RequestMethod.PUT },
      );
  }
}
