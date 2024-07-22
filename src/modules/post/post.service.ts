import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Post, type PostAttributes } from 'src/models/post';
import { CreatePostDto } from './dto/create.dto';
import {
  type DestroyOptions,
  type CreateOptions,
  type UpdateOptions,
  QueryTypes,
  type FindOptions,
} from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { PostResponseQuery } from './dto/postResponseQuery.dto';
import { PostResponseQueryDB } from './post.interface';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post)
    private readonly postModel: typeof Post,
    private readonly sequelize: Sequelize,
  ) {}

  public async create(
    payload: CreatePostDto,
    opts?: CreateOptions<PostAttributes>,
  ) {
    return await this.postModel.create(payload, opts);
  }

  public async findById(
    id: number,
    opts?: Omit<FindOptions<PostAttributes>, 'where'>,
  ) {
    return await this.postModel.findByPk(id, opts);
  }

  public async deleteOne(id: number, opts?: DestroyOptions<PostAttributes>) {
    return await this.postModel.destroy({ ...opts, where: { id } });
  }

  public async editText(
    id: number,
    text: string | null,
    tags: string[],
    opts?: UpdateOptions<PostAttributes>,
  ) {
    return await this.postModel.update(
      { text, editedText: true, tags },
      { ...opts, where: { id } },
    );
  }

  public async updateTotalLike(
    id: number,
    totalLike: number,
    opts?: Partial<UpdateOptions<PostAttributes>>,
  ) {
    return await this.postModel.update(
      { totalLike },
      { ...opts, where: { id } },
    );
  }

  public async updateTotalComment(
    id: number,
    countComment: number,
    opts?: Partial<UpdateOptions<PostAttributes>>,
  ) {
    return await this.postModel.update(
      { countComment },
      { ...opts, where: { id } },
    );
  }

  public async updateTotalShared(
    id: number,
    countShare: number,
    opts?: Partial<UpdateOptions<PostAttributes>>,
  ) {
    return await this.postModel.update(
      { countShare },
      { ...opts, where: { id } },
    );
  }

  public async getPublicContent(
    { page, limit }: PostResponseQuery,
    userId: string,
  ) {
    const now = new Date();
    const aWeekAgo = new Date(now.setDate(now.getDate() - 7)).toISOString();

    return await this.sequelize.query<PostResponseQueryDB>(
      `WITH 
        top_tags AS (
          SELECT
            "tags"
          FROM (
            SELECT
              "tags",
              COUNT(*) AS tag_count
            FROM "Posts"
            WHERE "createdAt" >= NOW() - INTERVAL '7 days'
                AND "privacy" = 'public'
            GROUP BY "tags"
            ORDER BY tag_count DESC
            LIMIT 1
          ) AS top_tag
        ),
        filtered_posts AS (
          SELECT 
            "id",
            "userId",
            "text",
            "allowComment",
            "createdAt",
            "updatedAt",
            "tags",
            "privacy",
            "communityId",
            "totalLike",
            "countComment",
            "countShare"
          FROM "Posts"
          WHERE "createdAt" >= $1
            AND "privacy" = 'public'
            OR "Posts"."userId" IN (
              SELECT "Follows"."followedId"
              FROM "Follows"
              WHERE "Follows"."followerId" = $2
            )
            OR EXISTS (
              SELECT 1
              FROM top_tags
              WHERE "tags" && ARRAY[top_tags.tags]::varchar[]
            )
            OR "communityId" IN (
              SELECT "communityId"
              FROM "CommunityMembers"
              WHERE "userId" = $2
            )
        ),  
        trending_data AS (
          SELECT 
            p."id",
            p."userId",
            p."text",
            p."allowComment",
            p."createdAt",
            p."updatedAt",
            p."privacy",
            p."communityId",
            COALESCE(json_agg(
            json_build_object(
              'fileId', pm."fileId",
              'url', pm."url",
              'type', pm."type"
              )
            ) FILTER (WHERE pm."fileId" IS NOT NULL), '[]'::json) AS "medias",
            p."totalLike" AS "countLike",
            p."countComment",
            p."countShare",
            EXISTS (SELECT 1 FROM "PostLikes" l2 WHERE l2."postId" = p."id" AND l2."userId" = $2) AS "isLiked",
            EXISTS (SELECT 1 FROM "PostShares" l2 WHERE l2."postId" = p."id" AND l2."userId" = $2) AS "isShared",
            CASE
              WHEN p."communityId" IS NOT NULL THEN json_build_object(
                'id', c."id",
                'name', c."name",
                'description', c."description",
                'imageUrl', c."imageUrl",
                'imageId', c."imageId",
                'owner', c."owner",
                'createdAt', c."createdAt",
                'updatedAt', c."updatedAt"
              )
              ELSE NULL
            END AS "community"
          FROM filtered_posts p
          LEFT JOIN "PostMedia" pm ON pm."postId" = p."id"
          LEFT JOIN "Communities" c ON c."id" = p."communityId"
          GROUP BY 
            p."id",
            p."userId",
            p."text",
            p."allowComment",
            p."createdAt",
            p."updatedAt",
            p."privacy",
            p."communityId",
            p."totalLike",
            p."countComment",
            p."countShare",
            c."id"
        ),
        post_data AS (
          SELECT 
            p."id",
            p."userId",
            p."text",
            p."allowComment",
            p."createdAt",
            p."updatedAt",
            p."privacy",
            p."communityId",
            p."medias",
            p."countLike",
            p."countComment",
            p."countShare",
            p."isLiked",
            p."isShared",
            p."community",
            COUNT(*) OVER() AS "totalData"
          FROM trending_data p
          ORDER BY p."createdAt" DESC
          LIMIT $3 OFFSET $4
        )
      SELECT 
      COALESCE(json_agg(json_build_object(
        'id', pd."id",
        'userId', pd."userId",
        'text', pd."text",
        'allowComment', pd."allowComment",
        'createdAt', pd."createdAt",
        'updatedAt', pd."updatedAt",
        'privacy', pd."privacy",
        'medias', pd."medias",
        'countLike', pd."countLike",
        'countComment', pd."countComment",
        'countShare', pd."countShare",
        'isLiked', pd."isLiked",
        'isShared', pd."isShared",
        'community', pd."community"
      )), '[]'::json) as "datas",
      MAX(pd."totalData") as "totalData"
      FROM post_data pd;`,
      {
        type: QueryTypes.SELECT,
        bind: [aWeekAgo, userId, limit, (page - 1) * limit],
      },
    );
  }
}
