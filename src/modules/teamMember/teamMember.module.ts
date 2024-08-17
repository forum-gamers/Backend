import {
  forwardRef,
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TeamMember } from 'src/models/teammember';
import { TeamMemberService } from './teamMember.service';
import { TeamModule } from '../team/team.module';
import { USER_VERIFIED_MIDDLEWARE } from 'src/constants/global.constant';
import { TeamMemberController } from './teamMember.controller';
import { UserOnly } from 'src/middlewares/user/userOnly.middleware';

@Module({
  imports: [
    SequelizeModule.forFeature([TeamMember]),
    forwardRef(() => TeamModule),
  ],
  providers: [TeamMemberService],
  exports: [TeamMemberService],
  controllers: [TeamMemberController],
})
export class TeamMemberModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(...USER_VERIFIED_MIDDLEWARE, UserOnly)
      .forRoutes(TeamMemberController);
  }
}
