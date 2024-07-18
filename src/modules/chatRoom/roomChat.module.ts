import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RoomChat } from 'src/models/roomchat';
import { RoomChatService } from './roomChat.service';
import { RoomChatController } from './roomChat.controller';
import { RoomChatValidation } from './roomChat.validation';
import { ThirdPartyModule } from 'src/third-party/third-party.module';
import { RoomMemberModule } from '../roomMember/roomMember.module';

@Module({
  imports: [
    SequelizeModule.forFeature([RoomChat]),
    ThirdPartyModule,
    RoomMemberModule,
  ],
  providers: [RoomChatService, RoomChatValidation],
  controllers: [RoomChatController],
})
export class RoomChatModule {}
