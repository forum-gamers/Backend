import { Module } from '@nestjs/common';
import { ThirdPartyModule } from '../../third-party/third-party.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../../models/user';
import { UserValidation } from './user.validation';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { WalletModule } from '../wallet/wallet.module';
import { ProfileViewerModule } from '../profileViewer/profileViewer.module';

@Module({
  imports: [
    ThirdPartyModule,
    SequelizeModule.forFeature([User]),
    WalletModule,
    ProfileViewerModule,
  ],
  providers: [UserValidation, UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
