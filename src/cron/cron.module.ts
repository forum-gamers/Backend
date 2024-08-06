import { Module } from '@nestjs/common';
import { ThirdPartyModule } from 'src/third-party/third-party.module';
import { BackupService } from './backup/backup.service';

@Module({
  imports: [ThirdPartyModule],
  providers: [BackupService],
})
export class CronModule {}
