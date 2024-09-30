import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TeamMember, type TeamMemberAttributes } from 'src/models/teammember';
import { CreateTeamMemberDto } from './dto/create.dto';
import {
  type DestroyOptions,
  type CreateOptions,
  type FindOptions,
  type UpdateOptions,
  QueryTypes,
  FindAndCountOptions,
} from 'sequelize';
import type { BaseQuery } from 'src/interfaces/request.interface';
import { Sequelize } from 'sequelize-typescript';
import type { TeamMemberDBResult } from './teamMember.interface';
import { plainToInstance } from 'class-transformer';
import { GetTeamMemberDto } from './dto/get.dto';

@Injectable()
export class TeamMemberService {
  constructor(
    @InjectModel(TeamMember)
    private readonly teamMemberModel: typeof TeamMember,
    private readonly sequelize: Sequelize,
  ) {}

  public async create(
    payload: CreateTeamMemberDto,
    opts?: CreateOptions<TeamMemberAttributes>,
  ) {
    return await this.teamMemberModel.create(payload, opts);
  }

  public async deleteByTeamId(
    teamId: string,
    opts?: Omit<DestroyOptions<TeamMemberAttributes>, 'where'>,
  ) {
    return await this.teamMemberModel.destroy({ ...opts, where: { teamId } });
  }

  public async findByTeamIdAndUserId(
    teamId: string,
    userId: string,
    opts?: Omit<FindOptions<TeamMemberAttributes>, 'where'>,
  ) {
    return await this.teamMemberModel.findOne({
      ...opts,
      where: { teamId, userId },
    });
  }

  public async deleteByTeamIdAndUserId(
    teamId: string,
    userId: string,
    opts?: Omit<DestroyOptions<TeamMemberAttributes>, 'where'>,
  ) {
    return await this.teamMemberModel.destroy({
      ...opts,
      where: { userId, teamId },
    });
  }

  public async getUnVerifiedMember(
    teamId: string,
    opts?: Omit<FindAndCountOptions<TeamMemberAttributes>, 'where'>,
  ) {
    return await this.teamMemberModel.findAndCountAll({
      ...opts,
      where: {
        teamId,
        status: false,
      },
    });
  }

  public async verifiedMember(
    userId: string,
    opts?: Omit<UpdateOptions<TeamMemberAttributes>, 'where'>,
  ) {
    return await this.teamMemberModel.update(
      { status: true },
      { ...opts, where: { userId } },
    );
  }

  public async findByTeamId(
    teamId: string,
    userId: string | null,
    {
      page = 1,
      limit = 15,
      q = null,
      status = true,
    }: BaseQuery & { q?: string; status?: boolean },
  ) {
    const bind: any[] = [limit, (page - 1) * limit, teamId, userId];
    if (q) bind.push(q);

    const [{ totalData, datas } = { totalData: 0, datas: [] }] =
      await this.sequelize.query<TeamMemberDBResult>(
        `WITH filtered_member AS (
        SELECT
          m.id, 
          m."teamId",
          m."userId", 
          m.role, 
          m.status, 
          m."createdAt",
          ${
            q
              ? `COALESCE(
                    ts_headline('english', u.username, plainto_tsquery('english', $5), 'StartSel = <b>, StopSel = </b>'),
                    ts_headline('indonesian', u.username, plainto_tsquery('indonesian', $5), 'StartSel = <b>, StopSel = </b>')
                ) AS username`
              : 'u.username'
          },
          EXISTS (
              SELECT 1
              FROM "Follows" f
              WHERE f."followerId" = $4 AND f."followedId" = m."userId"
            ) AS "isFollowed",
          EXISTS (
            SELECT 1
            FROM "TeamMembers" tm
            WHERE tm."userId" = $4 AND tm."teamId" = m."teamId"
          ) AS "isJoined",
          u."imageUrl" AS "userImageUrl",
          u.bio AS "userBio",
          u."backgroundImageUrl" AS "userBackgroundImageUrl",
          u."createdAt" AS "userCreatedAt"
          FROM "TeamMembers" m
          RIGHT JOIN "Users" u ON m."userId" = u.id
          WHERE m."teamId" = $3 AND m."status" = ${status} 
          ${
            q
              ? ` AND (u.username ILIKE '%' || $5 || '%' 
          OR (plainto_tsquery('english', $5) || plainto_tsquery('indonesian', $5)) @@ u."searchVectorUsername"
          OR u.username % $5
          OR similarity(u.username, $5) > 0.5)
          `
              : ''
          }
          ORDER BY m."createdAt" DESC, u."createdAt" DESC
      ),
      filtered_member_count AS (
        SELECT COUNT(*) AS "totalData" FROM filtered_member
      ),
      paginated_member AS (
        SELECT * FROM filtered_member LIMIT $1 OFFSET $2
      )
      SELECT 
        (SELECT "totalData" FROM filtered_member_count) AS "totalData",
        COALESCE(
          json_agg(
            json_build_object(
              'id', id,
              'teamId', "teamId",
              'userId', "userId",
              'isFollowed', "isFollowed",
              'role', role,
              'status', status,
              'createdAt', "createdAt",
              'username', username,
              'imageUrl', "userImageUrl",
              'userBio', "userBio",
              'userBackgroundImageUrl', "userBackgroundImageUrl",
              'userCreatedAt', "userCreatedAt"
            )
          ),
          '[]'::json
        ) AS "datas" FROM paginated_member
      `,
        {
          type: QueryTypes.SELECT,
          bind,
          benchmark: true,
        },
      );

    return {
      totalData: Number(totalData),
      datas: plainToInstance(GetTeamMemberDto, datas),
    };
  }
}
