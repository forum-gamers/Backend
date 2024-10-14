import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Tournament, type TournamentAttributes } from 'src/models/tournament';
import { CreateTournamentDto } from './dto/create.dto';
import {
  type FindOptions,
  Op,
  type UpdateOptions,
  type CreateOptions,
  QueryTypes,
} from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { TournamentDataDBResult } from './tournament.interface';
import { BaseQuery } from 'src/interfaces/request.interface';
import { plainToInstance } from 'class-transformer';
import { GetTournamentDto } from './dto/get.dto';

@Injectable()
export class TournamentService {
  constructor(
    @InjectModel(Tournament)
    private readonly model: typeof Tournament,
    private readonly sequelize: Sequelize,
  ) {}

  public async create(
    payload: CreateTournamentDto,
    opts?: CreateOptions<TournamentAttributes>,
  ) {
    return await this.model.create(payload, opts);
  }

  public async findActiveTourByCommunityId(
    communityId: number,
    gameId: number,
    opts?: Omit<FindOptions<TournamentAttributes>, 'where'>,
  ) {
    return await this.model.findAll({
      ...opts,
      where: {
        communityId,
        status: { [Op.or]: ['started', 'preparation'] },
        gameId,
      },
    });
  }

  public async findActiveTourByUserId(
    userId: string,
    gameId: number,
    opts?: Omit<FindOptions<TournamentAttributes>, 'where'>,
  ) {
    return await this.model.findAll({
      ...opts,
      where: {
        communityId: null,
        userId,
        gameId,
        status: { [Op.or]: ['started', 'preparation'] },
      },
    });
  }

  public async findById(id: number, opts?: FindOptions<TournamentAttributes>) {
    return await this.model.findByPk(id, opts);
  }

  public async updateMoneyPool(
    id: number,
    moneyPool: number,
    opts?: Omit<UpdateOptions<TournamentAttributes>, 'where'>,
  ) {
    return this.model.update({ moneyPool }, { ...opts, where: { id } });
  }

  public async getTournament({
    page = 1,
    limit = 10,
    q,
    userId,
  }: BaseQuery & { q?: string; userId: string }) {
    const bind: any[] = [(page - 1) * limit, limit, userId];
    if (q) bind.push(q);

    const [{ datas = [], totalData = 0 } = { datas: [], totalData: 0 }] =
      await this.sequelize.query<TournamentDataDBResult>(
        `WITH filtered_tournaments AS (
        SELECT 
          t.id,
          t.name,
          g.id AS "gameId",
          g.name AS "gameName",
          t."pricePool",
          t.slot,
          t."startDate",
          t."registrationFee",
          t.description,
          t."imageUrl",
          t."createdAt",
          t."updatedAt",
          u.id AS "userId",
          u.username,
          u."imageUrl" AS "userImageUrl",
          u.bio AS "userBio",
          u."createdAt" AS "userCreatedAt",
          u."backgroundImageUrl" AS "userBackgroundImageUrl",
          c.id AS "communityId",
          c.name AS "communityName",
          c.description AS "communityDescription",
          c."imageUrl" AS "communityImageUrl",
          c."imageId" AS "communityImageId",
          c."isDiscordServer" AS "communityIsDiscordServer",
          c.owner AS "communityOwner",
          (SELECT COUNT(*) FROM "TournamentParticipants" WHERE "tournamentId" = t.id) AS "participantsTotal",
          (SELECT COUNT(*) FROM "CommunityMembers" WHERE "communityId" = c.id) AS "communityTotalMember",
          (SELECT COUNT(*) FROM "Posts" WHERE "communityId" = c.id) AS "communityTotalPost",
          (SELECT COUNT(*) 
            FROM "CommunityEvents" 
            WHERE "communityId" = c.id
            AND ("isPublic" = true OR 
                  EXISTS (SELECT 1 FROM "CommunityMembers" 
                          WHERE "userId" = $3
                          AND "communityId" = c.id))) AS "communityTotalEvent",
          c."createdAt" AS "communityCreatedAt",
          c."updatedAt" AS "communityUpdatedAt",
          CASE
            WHEN EXISTS (
                  SELECT 1 FROM "CommunityMembers"
                  WHERE "userId" = $3 AND "communityId" = c.id
                ) THEN true
                ELSE false
            END AS "communityIsMember",
          t.tags,
          t.location,
          t."liveOn",
          t."isPublic",
          t."status"
        FROM "Tournaments" t
        LEFT JOIN "Games" g ON t."gameId" = g.id
        LEFT JOIN "Users" u ON t."userId" = u.id
        LEFT JOIN "Communities" c ON t."communityId" = c.id
        ${q ? `WHERE t.name ILIKE '%' || $4 || '%' OR t.description ILIKE '%' || $4 || '%' OR g.name ILIKE '%' || $4 || '%'` : ''}
        GROUP BY 
          t.id, 
          t.name, 
          g.name,
          g.id, 
          t."pricePool", 
          "participantsTotal",
          t.slot, 
          t."startDate", 
          t."registrationFee", 
          t.description, 
          t."updatedAt",
          t."imageUrl", 
          t."createdAt", 
          t.tags, 
          t.location, 
          t."liveOn", 
          t."isPublic", 
          t."status",
          u.id,
          c.id
        ORDER BY 
          t."createdAt" DESC, 
          t.status = 'preparation' DESC,
          t.status = 'started' DESC,
          t.slot DESC
      ),
      count_tournaments AS (
        SELECT COUNT(*) AS count FROM filtered_tournaments
      ),
      paginated_tournaments AS (
        SELECT 
          id,
          name,
          "gameName",
          "gameId",
          "pricePool",
          "participantsTotal",
          slot,
          "startDate",
          "registrationFee",
          description,
          "imageUrl",
          "createdAt",
          CASE WHEN "userId" IS NOT NULL THEN 
            json_build_object(
              'userId', "userId",
              'username', username,
              'userImageUrl', "userImageUrl",
              'userBio', "userBio",
              'userCreatedAt', "userCreatedAt",
              'userBackgroundImageUrl', "userBackgroundImageUrl"
            )
            ELSE NULL
            END AS "userData",
          CASE WHEN "communityId" IS NOT NULL THEN
            json_build_object(
              'id', "communityId",
              'name', "communityName",
              'description', "communityDescription",
              'imageUrl', "communityImageUrl",
              'imageId', "communityImageId",
              'isDiscordServer', "communityIsDiscordServer",
              'owner', "communityOwner",
              'totalMember', "communityTotalMember",
              'totalPost', "communityTotalPost",
              'totalEvent', "communityTotalEvent",
              'createdAt', "communityCreatedAt",
              'isMember', "communityIsMember",
              'updatedAt', "communityUpdatedAt"
              ) 
            ELSE NULL
            END AS "communityData",
          tags,
          location,
          "updatedAt",
          "liveOn",
          "isPublic",
          status
        FROM filtered_tournaments
        WHERE ("isPublic" = true OR "isPublic" = false AND "communityIsMember" = true)
        GROUP BY
          id, 
          name, 
          "gameId", 
          "gameName",
          "participantsTotal",
          username,
          "userImageUrl",
          "userBio",
          "userCreatedAt",
          "userBackgroundImageUrl",
          "communityId",
          "communityName",
          "communityDescription",
          "communityImageUrl",
          "communityImageId",
          "communityIsDiscordServer",
          "communityOwner",
          "communityTotalMember",
          "communityTotalPost",
          "communityTotalEvent",
          "communityCreatedAt",
          "communityIsMember",
          "communityUpdatedAt",
          "userId",
          "userImageUrl",
          "pricePool", 
          slot, 
          "startDate", 
          "registrationFee", 
          description, 
          "updatedAt",
          "imageUrl", 
          "createdAt", 
          tags, 
          location, 
          "liveOn", 
          "isPublic", 
          "status",
          "userId",
          "communityId"
        ORDER BY "createdAt" DESC, "participantsTotal" DESC
        LIMIT $2 OFFSET $1 
      )
      SELECT
        (SELECT count FROM count_tournaments) AS "totalData",
        COALESCE(
          json_agg(
            json_build_object(
              'id', id,
              'name', name,
              'gameId', "gameId",
              'gameName', "gameName",
              'participantsTotal', "participantsTotal",
              'pricePool', "pricePool",
              'slot', slot,
              'startDate', "startDate",
              'registrationFee', "registrationFee",
              'description', description,
              'imageUrl', "imageUrl",
              'createdAt', "createdAt",
              'user', "userData",
              'community', "communityData",
              'tags', tags,
              'location', location,
              'liveOn', "liveOn",
              'isPublic', "isPublic",
              'status', status,
              'updatedAt', "updatedAt"
            )
          ), '[]'::json
        ) AS datas FROM paginated_tournaments;
      `,
        { type: QueryTypes.SELECT, benchmark: true, bind },
      );

    return {
      datas: plainToInstance(GetTournamentDto, datas),
      totalData: Number(totalData),
    };
  }
}
