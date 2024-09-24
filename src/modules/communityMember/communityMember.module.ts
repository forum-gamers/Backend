import {
  forwardRef,
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommunityMembers } from 'src/models/communitymember';
import { CommunityMemberService } from './communityMember.service';
import { CommunityMemberController } from './communityMember.controller';
import { USER_VERIFIED_MIDDLEWARE } from 'src/constants/global.constant';
import { CommunityModule } from '../community/community.module';

@Module({
  imports: [
    SequelizeModule.forFeature([CommunityMembers]),
    forwardRef(() => CommunityModule),
  ],
  providers: [CommunityMemberService],
  exports: [CommunityMemberService],
  controllers: [CommunityMemberController],
})
export class CommunityMemberModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(...USER_VERIFIED_MIDDLEWARE)
      .forRoutes(CommunityMemberController);
  }
}
