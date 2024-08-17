import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
  RequestMethod,
} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Team } from 'src/models/team';
import { TeamService } from './team.service';
import { TeamMemberModule } from '../teamMember/teamMember.module';
import { TeamController } from './team.controller';
import { USER_VERIFIED_MIDDLEWARE } from 'src/constants/global.constant';
import { TeamValidation } from './team.validation';
import { ThirdPartyModule } from 'src/third-party/third-party.module';
import { UserOnly } from 'src/middlewares/user/userOnly.middleware';

@Module({
  imports: [
    SequelizeModule.forFeature([Team]),
    TeamMemberModule,
    ThirdPartyModule,
  ],
  providers: [TeamService, TeamValidation],
  controllers: [TeamController],
  exports: [TeamService],
})
export class TeamModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(...USER_VERIFIED_MIDDLEWARE)
      .forRoutes(TeamController)
      .apply(UserOnly)
      .forRoutes(
        {
          path: '/team',
          method: RequestMethod.POST,
        },
        {
          path: '/team',
          method: RequestMethod.DELETE,
        },
      );
  }
}
