import { Inject, UnauthorizedException } from '@nestjs/common';
import {
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  type OnGatewayInit,
  WebSocketGateway,
} from '@nestjs/websockets';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Server, Socket } from 'socket.io';
import { Logger } from 'winston';
import jwt from 'src/utils/global/jwt.utils';
import { type RoomChatAttributes } from 'src/models/roomchat';
import { DELETE_CHAT, NEW_CHAT, NEW_ROOM } from './ws.constant';
import { ChatAttributes } from 'src/models/chat';
import { RoomChatService } from '../chatRoom/roomChat.service';

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private clients = new Map<string, Socket>();

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private readonly roomChatService: RoomChatService,
  ) {}

  public afterInit(server: Server) {
    this.logger.info(`chat ws server started...`);
  }

  public async handleConnection(client: Socket, ...args: any[]) {
    try {
      const authorization = client.handshake.headers['authorization'];
      if (!authorization)
        throw new UnauthorizedException('missing or invalid authorization');

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
}
