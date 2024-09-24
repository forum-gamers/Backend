import {
  Global,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ThirdPartyModule } from '../../third-party/third-party.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../../models/user';
import { UserValidation } from './user.validation';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { WalletModule } from '../wallet/wallet.module';
import { ProfileViewerModule } from '../profileViewer/profileViewer.module';
import { UserAuthentication } from 'src/middlewares/user/authentication.middleware';
import { VerifiedMiddleware } from 'src/middlewares/user/verified.middleware';
import { DiscordModule } from '../discord/discord.module';

@Global()
@Module({
  imports: [
    ThirdPartyModule,
    SequelizeModule.forFeature([User]),
    WalletModule,
    ProfileViewerModule,
    DiscordModule,
  ],
  providers: [UserValidation, UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserAuthentication)
      .forRoutes(
        { path: '/user/me', method: RequestMethod.GET },
        { path: '/user/bio', method: RequestMethod.PATCH },
        { path: '/user/image', method: RequestMethod.PATCH },
        { path: '/user/:id', method: RequestMethod.GET },
        { path: '/user/change-password', method: RequestMethod.PATCH },
        { path: '/user/community/:id', method: RequestMethod.GET },
      )
      .apply(VerifiedMiddleware)
      .forRoutes(
        { path: '/user/me', method: RequestMethod.GET },
        { path: '/user/bio', method: RequestMethod.PATCH },
        { path: '/user/image', method: RequestMethod.PATCH },
        { path: '/user/:id', method: RequestMethod.GET },
        { path: '/user/community/:id', method: RequestMethod.GET },
      );
  }
}
