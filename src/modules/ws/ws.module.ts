import { forwardRef, Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { RoomChatModule } from '../chatRoom/roomChat.module';

@Module({
  imports: [forwardRef(() => RoomChatModule)],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class WsModule {}
