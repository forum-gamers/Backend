import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Admin } from 'src/models/admin';
import { AdminService } from './admin.service';
import { AdminValidation } from './admin.validation';
import { AdminController } from './admin.controller';

@Module({
  imports: [SequelizeModule.forFeature([Admin])],
  providers: [AdminService, AdminValidation],
  controllers: [AdminController],
})
export class AdminModule {}
