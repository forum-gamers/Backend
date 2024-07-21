import { forwardRef, Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { RoomChatModule } from '../chatRoom/roomChat.module';
import { WsValidation } from './ws.validation';
import { ChatReadModule } from '../chatRead/chatRead.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [forwardRef(() => RoomChatModule), ChatReadModule, ChatModule],
  providers: [ChatGateway, WsValidation],
  exports: [ChatGateway],
})
export class WsModule {}
