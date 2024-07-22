import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProfileViewers } from 'src/models/profileviewer';
import { ProfileViewerService } from './profileViewer.service';

@Module({
  imports: [SequelizeModule.forFeature([ProfileViewers])],
  providers: [ProfileViewerService],
  exports: [ProfileViewerService],
})
export class ProfileViewerModule {}
