import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ReplyComment } from 'src/models/replycomment';
import { ReplyService } from './reply.service';

@Module({
  imports: [SequelizeModule.forFeature([ReplyComment])],
  providers: [ReplyService],
  exports: [ReplyService],
})
export class ReplyModule {}
