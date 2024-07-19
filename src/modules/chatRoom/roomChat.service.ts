import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { RoomChat, type RoomChatAttributes } from 'src/models/roomchat';
import { CreateRoomChatDto } from './dto/create.dto';
import { QueryTypes, type CreateOptions } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { RoomMember } from 'src/models/roommember';
import { GetChatRoomsQuery } from './dto/query.dto';
import { RoomChatRespDto } from './dto/roomChatResp.dto';
import { QueryParamsDto } from 'src/utils/dto/pagination.dto';

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

  public async findById(id: number) {
    return await this.roomChatModel.findByPk(id);
  }

  public async findByIdAndPreloadMember(id: number, userId: string) {
    return await this.roomChatModel.findByPk(id, {
      include: [
        {
          model: RoomMember,
          where: { userId },
        },
      ],
    });
  }

  public async findByIdAndPreloadAllMember(id: number) {
    return await this.roomChatModel.findByPk(id, {
      include: [
        {
          model: RoomMember,
        },
      ],
    });
  }

  public async findMyRoomChats(
    userId: string,
    { page = 1, limit = 15 }: GetChatRoomsQuery,
  ) {
    return await this.sequelize.query<RoomChatRespDto>(
      `
        WITH latestChatPerRoom AS (
            SELECT
                "roomId",
                MAX("createdAt") AS lastChatTime
            FROM "Chats"
            GROUP BY "roomId"
            ),
            latestChat AS (
            SELECT
                lc."roomId",
                json_build_object(
                'senderId', c."senderId",
                'message', c."message",
                'file', c."file",
                'fileId', c."fileId",
                'fileType', c."fileType",
                'isRead', c."isRead",
                'status', c."status",
                'createdAt', c."createdAt",
                'updatedAt', c."updatedAt",
                'username', u."username",
                'imageUrl', u."imageUrl",
                'backgroundImageUrl', u."backgroundImageUrl"
                ) AS "lastChat",
                c."updatedAt" AS last_chat_updated
            FROM latestChatPerRoom lc
            JOIN "Chats" c ON lc."roomId" = c."roomId" AND lc.lastChatTime = c."createdAt"
            JOIN "Users" u ON c."senderId" = u."id"
            )
        SELECT
        r."id",
        r."owner",
        r."name",
        r."image",
        r."imageId",
        r."description",
        r."type",
        COALESCE(json_agg(lc."lastChat") FILTER (WHERE lc."lastChat" IS NOT NULL), '[]'::json) AS "lastChat"
        FROM "RoomChats" r
        JOIN "RoomMembers" rm ON r."id" = rm."roomId"
        LEFT JOIN latestChat lc ON r."id" = lc."roomId"
        WHERE rm."userId" = $1
        GROUP BY
        r."id",
        r."owner",
        r."name",
        r."image",
        r."imageId",
        r."description",
        r."type",
        lc.last_chat_updated
        ORDER BY lc.last_chat_updated ASC
        LIMIT $2 OFFSET $3;
    `,
      {
        type: QueryTypes.SELECT,
        bind: [userId, limit, (page - 1) * limit],
      },
    );
  }

  public async getChatByRoom(
    roomId: number,
    { page = 1, limit = 20 }: QueryParamsDto,
  ) {
    return await this.sequelize.query(
      `
       WITH room_info AS (
            SELECT 
                r."id" AS "roomId",
                r."owner",
                r."name",
                r."image",
                r."imageId",
                r."description",
                r."type"
            FROM "RoomChats" r
            WHERE r."id" = $1
            ),
            chat_info AS (
            SELECT 
                c."id" AS "chatId",
                c."roomId",
                c."senderId",
                c."message",
                c."file",
                c."fileId",
                c."fileType",
                c."isRead",
                c."status",
                c."createdAt" AS "chatCreatedAt",
                c."updatedAt" AS "chatUpdatedAt",
                u."username",
                u."imageUrl" AS "userImageUrl",
                u."backgroundImageUrl" AS "userBackgroundImageUrl"
            FROM "Chats" c
            JOIN "Users" u ON c."senderId" = u."id"
            WHERE c."roomId" = $1
            ORDER BY c."updatedAt" DESC
            LIMIT $2 OFFSET $3
            )
        SELECT 
        r."roomId",
        r."owner",
        r."name",
        r."image",
        r."imageId",
        r."description",
        r."type",
        COALESCE(json_agg(
            json_build_object(
            'id', ch."chatId",
            'senderId', ch."senderId",
            'message', ch."message",
            'file', ch."file",
            'fileId', ch."fileId",
            'fileType', ch."fileType",
            'isRead', ch."isRead",
            'status', ch."status",
            'createdAt', ch."chatCreatedAt",
            'updatedAt', ch."chatUpdatedAt",
            'username', ch."username",
            'imageUrl', ch."userImageUrl",
            'backgroundImageUrl', ch."userBackgroundImageUrl"
            )
        ), '[]') AS "chats"
        FROM room_info r
        LEFT JOIN chat_info ch ON r."roomId" = ch."roomId"
        GROUP BY 
        r."roomId",
        r."owner",
        r."name",
        r."image",
        r."imageId",
        r."description",
        r."type";
        `,
      {
        type: QueryTypes.SELECT,
        bind: [roomId, limit, (page - 1) * limit],
      },
    );
  }
}
