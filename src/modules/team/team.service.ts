import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Team, type TeamAttributes } from 'src/models/team';
import { CreateTeamDto } from './dto/create.dto';
import {
  type FindOptions,
  type CreateOptions,
  type DestroyOptions,
  type UpdateOptions,
  QueryTypes,
} from 'sequelize';
import type { BaseQuery } from 'src/interfaces/request.interface';
import { Sequelize } from 'sequelize-typescript';
import type { GetTeamQueryDB } from './team.interface';
import { plainToInstance } from 'class-transformer';
import { GetTeamDto } from './dto/get.dto';

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(Team)
    private readonly teamModel: typeof Team,
    private readonly sequelize: Sequelize,
  ) {}

  public async countByOwner(owner: string) {
    return await this.teamModel.count({ where: { owner } });
  }

  public async create(
    payload: CreateTeamDto,
    opts?: CreateOptions<TeamAttributes>,
  ) {
    return await this.teamModel.create(payload, opts);
  }

  public async findById(
    id: string,
    opts?: Omit<FindOptions<TeamAttributes>, 'where'>,
  ) {
    return await this.teamModel.findByPk(id, opts);
  }

  public async deleteById(
    id: string,
    opts?: Omit<DestroyOptions<TeamAttributes>, 'where'>,
  ) {
    return await this.teamModel.destroy({ ...opts, where: { id } });
  }

  public async updateTotalMember(
    id: string,
    totalMember: number,
    opts?: Omit<UpdateOptions<TeamAttributes>, 'where'>,
  ) {
    return await this.teamModel.update(
      { totalMember },
      { ...opts, where: { id } },
    );
  }

  public async findAll(
    { page, limit, q = null }: BaseQuery & { q?: string },
    userId: string,
  ) {
    const bind: any[] = [limit, (page - 1) * limit, userId];
    if (q) bind.push(q);
    const [{ datas, totalData } = { datas: [], totalData: 0 }] =
      await this.sequelize.query<GetTeamQueryDB>(
        `WITH filtered_teams AS (
          SELECT
            t.id,
            t.name,
            t.description,
            t."imageUrl",
            t.owner,
            t."createdAt",
            t."totalMember",
            g.id AS "gameId",
            t."isPublic",
            t."maxMember",
            g.name AS "gameName",
            g."imageUrl" AS "gameImageUrl",
            g.code AS "gameCode",
            u.username AS "ownerUsername",
            tm.status,
            u."imageUrl" AS "ownerImageUrl",
            u."backgroundImageUrl" AS "ownerBackgroundImageUrl",
            u."createdAt" AS "ownerCreatedAt",
            CASE 
              WHEN tm."userId" IS NOT NULL THEN true 
              ELSE false 
            END AS "isJoined",
            u.bio AS "ownerBio"
          FROM "Teams" t
          LEFT JOIN "TeamMembers" tm 
            ON t."id" = tm."teamId" 
            AND tm."userId" = $3
          INNER JOIN "Games" g ON t."gameId" = g.id
          INNER JOIN "Users" u ON t."owner" = u.id
          WHERE (t."isPublic" = true OR (t."isPublic" = false AND tm."userId" IS NOT NULL))
          ${q ? ` AND t."name" ILIKE '%' || $4 || '%' OR t.description ILIKE '%' || $4 || '%' OR g.name ILIKE '%' || $4 || '%'` : ''}
        ),
        filtered_teams_count AS (
          SELECT COUNT(*) AS total FROM filtered_teams
        ),
        paginated_teams AS (
          SELECT * FROM filtered_teams
          ORDER BY "totalMember" ASC,"createdAt" DESC, "maxMember" DESC
          LIMIT $1 OFFSET $2
        )
        SELECT 
          (SELECT total FROM filtered_teams_count) AS "totalData",
          COALESCE(
            json_agg(
              json_build_object(
                'id', id,
                'name', name,
                'description', description,
                'imageUrl', "imageUrl",
                'owner', owner,
                'createdAt', "createdAt",
                'totalMember', "totalMember",
                'isPublic', "isPublic",
                'maxMember', "maxMember",
                'gameId', "gameId",
                'gameName', "gameName",
                'gameImageUrl', "gameImageUrl",
                'gameCode', "gameCode",
                'status', "status",
                'isJoined', "isJoined",
                'ownerUsername', "ownerUsername",
                'ownerImageUrl', "ownerImageUrl",
                'ownerBackgroundImageUrl', "ownerBackgroundImageUrl",
                'ownerCreatedAt', "ownerCreatedAt",
                'ownerBio', "ownerBio"
              )
            ), '[]'::json
          ) AS "datas"
        FROM paginated_teams
        `,
        { type: QueryTypes.SELECT, benchmark: true, bind },
      );

    return {
      totalData: Number(totalData),
      datas: plainToInstance(GetTeamDto, datas),
    };
  }

  public async findDetailById(teamId: string, userId: string) {
    const [result] = await this.sequelize.query<GetTeamDto>(
      `SELECT
        t.id,
        t.name,
        t.description,
        t."imageUrl",
        t.owner,
        t."createdAt",
        t."totalMember",
        g.id AS "gameId",
        t."isPublic",
        t."maxMember",
        g.name AS "gameName",
        g."imageUrl" AS "gameImageUrl",
        g.code AS "gameCode",
        u.username AS "ownerUsername",
        u."imageUrl" AS "ownerImageUrl",
        u."backgroundImageUrl" AS "ownerBackgroundImageUrl",
        tm.status,
        u."createdAt" AS "ownerCreatedAt",
        CASE 
          WHEN tm."userId" IS NOT NULL THEN true 
          ELSE false 
        END AS "isJoined",
        u.bio AS "ownerBio"
      FROM "Teams" t
      LEFT JOIN "TeamMembers" tm 
        ON t."id" = tm."teamId" 
        AND tm."userId" = $2
      INNER JOIN "Games" g ON t."gameId" = g.id
      INNER JOIN "Users" u ON t."owner" = u.id
      WHERE t.id = $1 AND (t."isPublic" = true OR (t."isPublic" = false AND tm."userId" IS NOT NULL))`,
      { type: QueryTypes.SELECT, bind: [teamId, userId], benchmark: true },
    );

    if (!result) return null;

    return plainToInstance(GetTeamDto, result);
  }
}
