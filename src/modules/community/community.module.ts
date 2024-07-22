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

@Module({
  imports: [
    SequelizeModule.forFeature([Community]),
    ThirdPartyModule,
    CommunityMemberModule,
  ],
  providers: [CommunityService, CommunityValidation],
  controllers: [CommunityController],
})
export class CommunityModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CommunityAccessMiddleware)
      .forRoutes({ path: '/community/:id', method: RequestMethod.DELETE });
  }
}
