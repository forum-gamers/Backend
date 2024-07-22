import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PostShare } from 'src/models/postshare';
import { PostShareService } from './postShare.service';
import { PostShareController } from './postShare.controller';
import { PostModule } from '../post/post.module';
import { UserPreferenceModule } from '../userPreference/userPreference.module';

@Module({
  imports: [
    SequelizeModule.forFeature([PostShare]),
    PostModule,
    UserPreferenceModule,
  ],
  providers: [PostShareService],
  controllers: [PostShareController],
})
export class PostShareModule {}
