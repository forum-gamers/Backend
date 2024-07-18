import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RoomMember } from 'src/models/roommember';
import { RoomMemberService } from './roomMember.service';

@Module({
  imports: [SequelizeModule.forFeature([RoomMember])],
  providers: [RoomMemberService],
  exports: [RoomMemberService],
})
export class RoomMemberModule {}
