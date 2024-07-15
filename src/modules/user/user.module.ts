import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ThirdPartyModule } from '../../third-party/third-party.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../../models/user';
import { UserValidation } from './user.validation';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { WalletModule } from '../wallet/wallet.module';
import { UserAuthentication } from '../../middlewares/user/authentication.middleware';
import { VerifiedMiddleware } from '../../middlewares/user/verified.middleware';

@Module({
  imports: [ThirdPartyModule, SequelizeModule.forFeature([User]), WalletModule],
  providers: [UserValidation, UserService],
  controllers: [UserController],
})
export class UserModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserAuthentication)
      .exclude(
        { path: 'user/register', method: RequestMethod.POST },
        { path: 'user/login', method: RequestMethod.POST },
        { path: 'user/resend-email', method: RequestMethod.POST },
        { path: 'user/verify', method: RequestMethod.PATCH },
      )
      .forRoutes(UserController)
      .apply(VerifiedMiddleware)
      .exclude(
        { path: 'user/register', method: RequestMethod.POST },
        { path: 'user/login', method: RequestMethod.POST },
        { path: 'user/resend-email', method: RequestMethod.POST },
        { path: 'user/verify', method: RequestMethod.PATCH },
      )
      .forRoutes(UserController);
  }
}
