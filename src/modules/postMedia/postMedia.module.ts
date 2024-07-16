import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PostMedia } from 'src/models/postMedia';
import { PostMediaService } from './postMedia.service';

@Module({
  imports: [SequelizeModule.forFeature([PostMedia])],
  providers: [PostMediaService],
  exports: [PostMediaService],
})
export class PostMediaModule {}
