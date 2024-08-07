import {
  Global,
  type MiddlewareConsumer,
  Module,
  type NestModule,
  RequestMethod,
} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Admin } from 'src/models/admin';
import { AdminService } from './admin.service';
import { AdminValidation } from './admin.validation';
import { AdminController } from './admin.controller';
import { UserAuthentication } from 'src/middlewares/user/authentication.middleware';
import { AdminOnly } from 'src/middlewares/admin/adminOnly.middleware';
import { AdminLogger } from 'src/middlewares/admin/adminLogger.middleware';
import { AdminHelper } from './admin.helper';

@Global()
@Module({
  imports: [SequelizeModule.forFeature([Admin])],
  providers: [AdminService, AdminValidation, AdminHelper],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserAuthentication, AdminOnly, AdminLogger)
      .forRoutes(
        { path: '/admin/register', method: RequestMethod.POST },
        { path: '/admin/user/block/:id', method: RequestMethod.PATCH },
        { path: '/admin/user/unblock/:id', method: RequestMethod.PATCH },
      );
  }
}
