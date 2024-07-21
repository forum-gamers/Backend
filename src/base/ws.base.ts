import type {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

export abstract class BaseWsHandler
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  protected getAuthorization(client: Socket) {
    return client.handshake.headers['authorization'];
  }

  protected clients = new Map<string, Socket>();

  abstract handleConnection(client: Socket, ...args: any[]): void;

  abstract handleDisconnect(client: Socket): void;

  abstract afterInit(server: Server): void;
}
