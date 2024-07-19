import { Global, Module } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module';
import { ChatGateway } from './chat.gateway';

@Global()
@Module({
  imports: [ChatModule],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class WsModule {}
