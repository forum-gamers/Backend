import {
  forwardRef,
  type MiddlewareConsumer,
  Module,
  type NestModule,
  RequestMethod,
} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Chat } from 'src/models/chat';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ThirdPartyModule } from 'src/third-party/third-party.module';
import { WsModule } from '../ws/ws.module';
import { RoomChatModule } from '../chatRoom/roomChat.module';
import { ChatValidation } from './chat.validation';
import { RoomChatAccessMiddleware } from 'src/middlewares/roomChat/access.middleware';
import { ChatAccessMiddleware } from 'src/middlewares/chat/access.middleware';
import { USER_VERIFIED_MIDDLEWARE } from 'src/constants/global.constant';

@Module({
  imports: [
    SequelizeModule.forFeature([Chat]),
    ThirdPartyModule,
    forwardRef(() => RoomChatModule),
    forwardRef(() => WsModule),
  ],
  providers: [ChatService, ChatValidation],
  exports: [ChatService],
  controllers: [ChatController],
})
export class ChatModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(...USER_VERIFIED_MIDDLEWARE)
      .forRoutes(ChatController)
      .apply(RoomChatAccessMiddleware)
      .forRoutes({ path: 'chat/:id', method: RequestMethod.POST })
      .apply(ChatAccessMiddleware)
      .forRoutes({ path: 'chat/:chatId', method: RequestMethod.DELETE });
  }
}
