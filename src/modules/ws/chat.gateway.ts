import { Inject, UseFilters } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  WsException,
  BaseWsExceptionFilter,
} from '@nestjs/websockets';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Server, Socket } from 'socket.io';
import { Logger } from 'winston';
import jwt from 'src/utils/global/jwt.utils';
import { type RoomChatAttributes } from 'src/models/roomchat';
import {
  DELETE_CHAT,
  NEW_CHAT,
  NEW_ROOM,
  UPDATE_READ_STATUS,
} from './ws.constant';
import { ChatAttributes } from 'src/models/chat';
import { RoomChatService } from '../chatRoom/roomChat.service';
import { BaseWsHandler } from 'src/base/ws.base';
import { WsValidation } from './ws.validation';
import { UpdateReadProps } from './ws.interface';
import { ChatReadService } from '../chatRead/chatRead.service';
import { Sequelize } from 'sequelize-typescript';
import { ChatService } from '../chat/chat.service';
import { CreateChatReadDto } from '../chatRead/dto/create.dto';

@WebSocketGateway({ namespace: 'chat' })
@UseFilters(new BaseWsExceptionFilter())
export class ChatGateway extends BaseWsHandler {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private readonly roomChatService: RoomChatService,
    private readonly wsValidation: WsValidation,
    private readonly chatReadService: ChatReadService,
    private readonly sequelize: Sequelize,
    private readonly chatService: ChatService,
  ) {
    super();
  }

  public afterInit(server: Server) {
    this.logger.info(`chat ws server started...`);
  }

  public async handleConnection(client: Socket, ...args: any[]) {
    try {
      const authorization = this.getAuthorization(client);
      if (!authorization)
        throw new WsException('missing or invalid authorization');

      const { id } = jwt.verifyToken(authorization);
      if (!this.clients.get(id)) this.clients.set(id, client);
    } catch (err) {
      client.disconnect(true);
    }
  }

  public async handleDisconnect(client: Socket) {
    const token = client.handshake.headers['authorization'];
    if (token) {
      const { id } = jwt.decodeToken(token);
      this.clients.delete(id);
    }
    client.disconnect(true);
  }

  public sendNewRoom(roomChat: RoomChatAttributes, userIds: string[]) {
    for (const userId of userIds)
      if (this.clients.has(userId))
        this.clients.get(userId).emit(NEW_ROOM, roomChat);
  }

  public async sendNewChat(chat: ChatAttributes) {
    const room = await this.roomChatService.findByIdAndPreloadAllMember(
      chat.roomId,
    );
    if (!room) return;
    for (const member of room.members)
      if (this.clients.has(member.userId))
        this.clients.get(member.userId).emit(NEW_CHAT, chat);
  }

  public async deletedChat(chatId: number, roomId: number) {
    const room = await this.roomChatService.findByIdAndPreloadAllMember(roomId);
    if (!room) return;
    for (const member of room.members)
      if (this.clients.has(member.userId))
        this.clients.get(member.userId).emit(DELETE_CHAT, chatId);
  }

  @SubscribeMessage(UPDATE_READ_STATUS)
  public async handleUpdateReadStatus(
    @MessageBody() payload: UpdateReadProps,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const authorization = this.getAuthorization(client);
      if (!authorization)
        throw new WsException('missing or invalid authorization');

      const { id } = jwt.verifyToken(authorization);

      if (!this.clients.has(id)) return;

      const { chatIds, roomId } =
        await this.wsValidation.validateUpdateReadStatus(payload);

      const room = await this.roomChatService.findByIdAndPreloadMember(
        roomId,
        id,
      );
      if (!room || room.members.length || room.members[0].userId !== id) return;

      const chats = await this.chatService.findByMultipleIds(chatIds);
      if (!chats.length) return;

      const transaction = await this.sequelize.transaction();
      const payloads: CreateChatReadDto[] = [];
      try {
        for (const chat of chats)
          if (chatIds.includes(chat.id))
            payloads.push(
              new CreateChatReadDto({
                chatId: chat.id,
                userId: id,
              }),
            );

        await Promise.all(
          payloads.map(async (el) => await this.chatReadService.create(el)),
        );
        await transaction.commit();
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    } catch (err) {
      return;
    }
  }
}
