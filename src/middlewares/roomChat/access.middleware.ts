import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  type NestMiddleware,
} from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { RoomChatService } from 'src/modules/chatRoom/roomChat.service';

/**
 * @info
 * @description
 * always bring chatRoom 'id' on request params except create
 */
@Injectable()
export class ChatAccessMiddleware implements NestMiddleware {
  public async use(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const value = parseInt(id);
    if (isNaN(value)) throw new BadRequestException('id must be a number');

    const { id: userId } = req.user;

    const room = await this.roomChatService.findByIdAndPreloadMember(
      value,
      userId,
    );
    if (!room) throw new NotFoundException('room not found');

    const member = room.members[0];
    if (!member) throw new UnauthorizedException('you have not access');

    req.roomChat = room.dataValues;
    req.roomMember = member.dataValues;

    next();
  }

  constructor(private readonly roomChatService: RoomChatService) {}
}
