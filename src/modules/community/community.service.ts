import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Community, type CommunityAttributes } from 'src/models/community';
import { CreateCommunityDto } from './dto/create.dto';
import { type DestroyOptions, type CreateOptions, QueryTypes } from 'sequelize';
import { CommunityMembers } from 'src/models/communitymember';
import { User } from 'src/models/user';
import { Sequelize } from 'sequelize-typescript';
import { BaseQuery } from 'src/interfaces/request.interface';
import { IGetCommunityDBResponse } from './community.interface';
import { plainToInstance } from 'class-transformer';
import { GetCommunityDto } from './dto/get.dto';

@Injectable()
export class CommunityService {
  constructor(
    @InjectModel(Community)
    private readonly communityModel: typeof Community,
    private readonly sequelize: Sequelize,
  ) {}

  public async findOneByName(name: string) {
    return await this.communityModel.findOne({ where: { name } });
  }

  public async create(
    payload: CreateCommunityDto,
    opts?: CreateOptions<CommunityAttributes>,
  ) {
    return await this.communityModel.create(payload, opts);
  }

  public async findById(id: number) {
    return await this.communityModel.findByPk(id);
  }

  public async findByIdAndFindMe(id: number, userId: string) {
    return (await this.communityModel.findByPk(id, {
      include: [
        {
          model: CommunityMembers,
          where: { userId },
          required: false,
          include: [
            {
              model: User,
              as: 'user',
            },
          ],
        },
      ],
    })) as
      | (Community & { members: (CommunityMembers & { user: User }) | null })
      | null;
  }

  public async deleteOne(
    id: number,
    opts?: DestroyOptions<CommunityAttributes>,
  ) {
    return await this.communityModel.destroy({ ...opts, where: { id } });
  }

  public async findAndCountAll({
    page = 1,
    limit = 10,
    q,
    userId,
  }: BaseQuery & { q?: string; userId: string }) {
    const bind: any[] = [(page - 1) * limit, limit, userId];
    if (q) bind.push(q);

    const [{ totalData, datas } = { totalData: 0, datas: [] }] =
      await this.sequelize.query<IGetCommunityDBResponse>(
        `
        WITH filtered_communities AS (
          SELECT
            c.id,
           ${
             q
               ? `COALESCE(
          ts_headline('english', c.name, plainto_tsquery('english', $4), 'StartSel = <b>, StopSel = </b>'),
          ts_headline('indonesian', c.name, plainto_tsquery('indonesian', $4), 'StartSel = <b>, StopSel = </b>')
        ) AS name,
        COALESCE(
          ts_headline('english', c.description, plainto_tsquery('english', $4), 'StartSel = <b>, StopSel = </b>'),
          ts_headline('indonesian', c.description, plainto_tsquery('indonesian', $4), 'StartSel = <b>, StopSel = </b>')
        ) AS description`
               : 'c.name, c.description'
           },
            c."imageUrl",
            c."imageId",
            c."isDiscordServer",
            c.owner,
            (SELECT COUNT(*) FROM "CommunityMembers" WHERE "communityId" = c.id) AS "totalMember",
            (SELECT COUNT(*) FROM "Posts" WHERE "communityId" = c.id) AS "totalPost",
            c."createdAt",
            c."updatedAt",
            c."searchVectorName",
            c."searchVectorDescription",
            CASE
              WHEN EXISTS (
                SELECT 1 FROM "CommunityMembers"
                WHERE "userId" = $3 AND "communityId" = c.id
              ) THEN true
              ELSE false
            END AS "isMember"
          FROM "Communities" c
          ${
            q
              ? `
            WHERE
              (c."searchVectorName" @@ plainto_tsquery('english', $4)
              OR c."searchVectorDescription" @@ plainto_tsquery('english', $4)) 
              OR c.name ILIKE '%' || $4 || '%' OR c.description ILIKE '%' || $4 || '%' OR c.name % $4 OR c.description % $4
          `
              : ''
          }
        ),
        count_communities AS (
          SELECT COUNT(*) AS count FROM filtered_communities
        ),
        paginated_communities AS (
          SELECT
            id,
            name,
            description,
            "imageUrl",
            "imageId",
            "isDiscordServer",
            owner,
            "totalMember",
            "totalPost",
            "createdAt",
            "updatedAt",
            "isMember"
          FROM filtered_communities
          ORDER BY 
            ${q ? 'ts_rank("searchVectorName", plainto_tsquery(\'english\', $4)) DESC, ts_rank("searchVectorDescription", plainto_tsquery(\'english\', $4)) DESC,' : ''}
            CASE WHEN "isMember" THEN 1 ELSE 0 END,
            "createdAt" DESC
          LIMIT $2 OFFSET $1
        )
        SELECT
          (SELECT count FROM count_communities) AS "totalData",
          COALESCE(
            json_agg(json_build_object(
              'id', id,
              'name', name,
              'description', description,
              'imageUrl', "imageUrl",
              'imageId', "imageId",
              'isDiscordServer', "isDiscordServer",
              'owner', owner,
              'totalMember', "totalMember",
              'totalPost', "totalPost",
              'createdAt', "createdAt",
              'updatedAt', "updatedAt",
              'isMember', "isMember"
            )),
            '[]'::json
          ) AS "datas"
        FROM paginated_communities;
        `,
        {
          type: QueryTypes.SELECT,
          benchmark: true,
          bind,
        },
      );

    return {
      datas: plainToInstance(GetCommunityDto, datas),
      totalData: Number(totalData),
    };
  }
}
