import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Post, type PostAttributes } from 'src/models/post';
import { CreatePostDto } from './dto/create.dto';
import {
  type DestroyOptions,
  type CreateOptions,
  type UpdateOptions,
  QueryTypes,
} from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { PostResponse } from './dto/postResponse.dto';
import { PostResponseQuery } from './dto/postResponseQuery.dto';

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

  public async findById(id: number) {
    return await this.postModel.findByPk(id);
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

  public async getPublicContent(
    { tags, userIds, page, limit }: PostResponseQuery,
    userId: string,
  ) {
    const now = new Date();
    const threeDaysAgo = new Date(now.setDate(now.getDate() - 7)).toISOString();
    const offset = (page - 1) * limit;
    return await this.sequelize.query<{
      datas: PostResponse[];
      totalData: number;
    }>(
      `WITH filtered_posts AS (
        SELECT 
          "id",
          "userId",
          "text",
          "allowComment",
          "createdAt",
          "updatedAt",
          "tags",
          "privacy"
        FROM "Posts"
        WHERE "createdAt" >= $1
          AND "privacy" = 'public'
          ${tags && tags.length > 0 ? `AND "tags" && ARRAY[${tags.map((tag) => `'${tag}'`).join(',')}]::varchar[]` : ''}
          ${userIds && userIds.length > 0 ? `AND "userId" IN (${userIds.map((id) => `'${id}'`).join(',')})` : ''}
      ), 
      post_data AS (
        SELECT 
          p."id",
          p."userId",
          p."text",
          p."allowComment",
          p."createdAt",
          p."updatedAt",
          p."tags",
          p."privacy",
          (SELECT COUNT(*) FROM "PostLikes" l WHERE l."postId" = p."id") as "countLike",
          (SELECT COUNT(*) FROM "PostComments" c WHERE c."postId" = p."id") as "countComment",
          EXISTS (SELECT 1 FROM "PostLikes" l2 WHERE l2."postId" = p."id" AND l2."userId" = $2) as "isLiked"
        FROM filtered_posts p
        LEFT JOIN "PostLikes" l ON l."postId" = p."id"
        LEFT JOIN "PostComments" c ON c."postId" = p."id"
        GROUP BY 
          p."id",
          p."userId",
          p."text",
          p."allowComment",
          p."createdAt",
          p."updatedAt",
          p."tags",
          p."privacy"
        ORDER BY p."createdAt" DESC
        LIMIT $3 OFFSET $4
      )
      SELECT 
        (SELECT COUNT(*) FROM filtered_posts)::INTEGER as "totalData",
        json_agg(post_data) as "datas"
      FROM post_data;`,
      {
        type: QueryTypes.SELECT,
        bind: [threeDaysAgo, userId, limit, offset],
      },
    );
  }
}
