import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
  RequestMethod,
} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RoomChat } from 'src/models/roomchat';
import { RoomChatService } from './roomChat.service';
import { RoomChatController } from './roomChat.controller';
import { RoomChatValidation } from './roomChat.validation';
import { ThirdPartyModule } from 'src/third-party/third-party.module';
import { RoomMemberModule } from '../roomMember/roomMember.module';
import { ChatAccessMiddleware } from 'src/middlewares/roomChat/access.middleware';
import { WsModule } from '../ws/ws.module';

@Module({
  imports: [
    SequelizeModule.forFeature([RoomChat]),
    ThirdPartyModule,
    RoomMemberModule,
    WsModule,
  ],
  providers: [RoomChatService, RoomChatValidation],
  controllers: [RoomChatController],
  exports: [RoomChatService],
})
export class RoomChatModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ChatAccessMiddleware)
      .exclude({ path: 'room-chat', method: RequestMethod.POST })
      .forRoutes(RoomChatController);
  }
}
