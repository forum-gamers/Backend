import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Chat, type ChatAttributes } from 'src/models/chat';
import { CreateChatDto } from './dto/create.dto';
import {
  QueryTypes,
  type UpdateOptions,
  type CreateOptions,
  Op,
} from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ChatCtxDto } from './dto/chatCtx.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat)
    private readonly chatModel: typeof Chat,
    private readonly sequelize: Sequelize,
  ) {}

  public async create(
    payload: CreateChatDto,
    opts?: CreateOptions<ChatAttributes>,
  ) {
    return await this.chatModel.create(payload, opts);
  }

  public async findByIdAndPreloadRelated(id: number) {
    const result = await this.sequelize.query<ChatCtxDto | null>(
      `SELECT 
        c."id", c."roomId", c."senderId" AS "userId", c."message", c."file", c."fileId", c."fileType", c."isRead", c."status",
        r."owner" AS "roomOwner", r."name" AS "roomName", r."image" AS "roomImage", r."imageId" AS "roomImageId", r."description" AS "roomDescription", r."type" AS "roomType",
        m."role" AS "role"
        FROM "Chats" c
        JOIN "RoomChats" r ON c."roomId" = r."id"
        JOIN "RoomMembers" m ON m."roomId" = r."id"
        WHERE c."id" = $1
        `,
      {
        type: QueryTypes.SELECT,
        bind: [id],
      },
    );
    return result[0] ?? null;
  }

  public async setDelete(id: number, opts?: UpdateOptions<ChatAttributes>) {
    return await this.chatModel.update(
      { status: 'deleted' },
      { ...opts, where: { id } },
    );
  }

  public async findByMultipleIds(ids: number[]) {
    return await this.chatModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
  }
}
