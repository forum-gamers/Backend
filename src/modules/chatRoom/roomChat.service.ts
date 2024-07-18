import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { RoomChat, type RoomChatAttributes } from 'src/models/roomchat';
import { CreateRoomChatDto } from './dto/create.dto';
import { QueryTypes, type CreateOptions } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class RoomChatService {
  constructor(
    @InjectModel(RoomChat)
    private readonly roomChatModel: typeof RoomChat,
    private readonly sequelize: Sequelize,
  ) {}

  public async create(
    payload: CreateRoomChatDto,
    opts?: CreateOptions<RoomChatAttributes>,
  ) {
    return await this.roomChatModel.create(payload, opts);
  }

  public async findGroupByName(name: string) {
    return await this.roomChatModel.findOne({ where: { name, type: 'group' } });
  }

  public async findExistingPrivateRoomChat(users: [string, string]) {
    return await this.sequelize.query<RoomChat>(
      `
        SELECT "roomChat".*
        FROM "RoomChats" AS "roomChat"
        INNER JOIN "RoomMembers" AS "RoomMembers" ON "roomChat"."id" = "RoomMembers"."roomId"
        WHERE "roomChat"."type" = 'private'
          AND "RoomMembers"."userId" IN ($1, $2)
        GROUP BY "roomChat"."id"
        HAVING COUNT(DISTINCT "RoomMembers"."userId") = 2;
        `,
      {
        type: QueryTypes.SELECT,
        bind: users,
      },
    );
  }
}
