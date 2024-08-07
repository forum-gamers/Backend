import { Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AdminLog } from 'src/models/adminlog';
import { AdminLogService } from './adminLog.service';

@Global()
@Module({
  imports: [SequelizeModule.forFeature([AdminLog])],
  providers: [AdminLogService],
  exports: [AdminLogService],
})
export class AdminLogModule {}
