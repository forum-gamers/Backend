import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Follow } from 'src/models/follow';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { FollowValidation } from './follow.validation';

@Module({
  imports: [SequelizeModule.forFeature([Follow])],
  providers: [FollowService, FollowValidation],
  controllers: [FollowController],
})
export class FollowModule {}
