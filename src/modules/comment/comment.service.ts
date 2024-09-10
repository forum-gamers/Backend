import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  PostComment,
  type PostCommentAttributes,
} from 'src/models/postcomment';
import { CreateCommentDto } from './dto/create.dto';
import {
  type Attributes,
  type FindOptions,
  QueryTypes,
  type CreateOptions,
  type DestroyOptions,
} from 'sequelize';
import { QueryParamsDto } from 'src/utils/dto/pagination.dto';
import { Post } from 'src/models/post';
import { Sequelize } from 'sequelize-typescript';
import { CommentResponseQueryResult } from './comment.interface';
import { CommentResponseDto } from './dto/commentResponse.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(PostComment)
    private readonly commentModel: typeof PostComment,
    private readonly sequelize: Sequelize,
  ) {}

  public async create(
    payload: CreateCommentDto,
    opts?: CreateOptions<PostCommentAttributes>,
  ) {
    return await this.commentModel.create(payload, opts);
  }

  public async deleteAllByPostId(
    postId: number,
    opts?: Partial<DestroyOptions<PostCommentAttributes>>,
  ) {
    return await this.commentModel.destroy({ ...opts, where: { postId } });
  }

  public async deleteById(
    id: number,
    opts?: Partial<DestroyOptions<PostCommentAttributes>>,
  ) {
    return await this.commentModel.destroy({ ...opts, where: { id } });
  }

  public async findAllByPostId(postId: number) {
    return await this.commentModel.findAll({ where: { postId } });
  }

  public async findById(
    id: number,
    opts?: Omit<FindOptions<Attributes<PostComment>>, 'where'>,
  ) {
    return await this.commentModel.findByPk(id, opts);
  }

  public async findByIdAndPreloadPostId(
    id: number,
    opts?: Omit<FindOptions<Attributes<PostComment>>, 'where'>,
  ) {
    return await this.commentModel.findByPk(id, {
      ...opts,
      include: [
        {
          model: Post,
          required: true,
        },
      ],
    });
  }

  public async getPostComment(
    postId: number,
    { page = 1, limit = 10 }: QueryParamsDto,
    userId = '',
  ) {
    const [{ rows, count }] =
      await this.sequelize.query<CommentResponseQueryResult>(
        `
          WITH comments_cte AS (
            SELECT
              c.id,
              c."userId",
              c."postId",
              c.text,
              c."createdAt",
              c."updatedAt",
              u.username,
              u."imageUrl",
              u."backgroundImageUrl",
              u."createdAt" AS "userCreatedAt",
              u.bio,
              EXISTS (
                SELECT 1 
                FROM "Follows" f 
                WHERE f."followerId" = $4 
                  AND f."followedId" = c."userId"
              ) AS "isFollowed",
              COALESCE(
              (
                SELECT json_agg(
                  json_build_object(
                    'id', r.id,
                    'userId', r."userId",
                    'commentId', r."commentId",
                    'text', r.text,
                    'createdAt', r."createdAt",
                    'updatedAt', r."updatedAt",
                    'username', ru.username,
                    'backgroundImageUrl', ru."backgroundImageUrl",
                    'userCreatedAt', ru."createdAt",
                    'imageUrl', ru."imageUrl",
                    'bio', ru.bio,
                    'isFollowed', EXISTS (
                        SELECT 1 
                        FROM "Follows" f 
                        WHERE f."followerId" = $4 
                          AND f."followedId" = r."userId"
                      )
                  )
                )
                FROM "ReplyComments" r
                JOIN "Users" ru ON r."userId" = ru.id
                WHERE r."commentId" = c.id
              ), '[]'::json) AS replies
            FROM "PostComments" c
            JOIN "Users" u ON c."userId" = u.id
            WHERE c."postId" = $1
            ORDER BY c."createdAt" DESC
            LIMIT $2 OFFSET $3
          )
          SELECT
            (SELECT COUNT(*) FROM "PostComments" WHERE "postId" = $1) AS count,
            COALESCE(
              (
                SELECT json_agg(
                  json_build_object(
                    'id', c.id,
                    'userId', c."userId",
                    'postId', c."postId",
                    'text', c.text,
                    'createdAt', c."createdAt",
                    'updatedAt', c."updatedAt",
                    'username', c.username,
                    'imageUrl', c."imageUrl",
                    'backgroundImageUrl', c."backgroundImageUrl",
                    'userCreatedAt', c."userCreatedAt",
                    'bio', c.bio,
                    'isFollowed', c."isFollowed",
                    'replies', COALESCE(c.replies, '[]'::json)
                  )
                )
                FROM comments_cte c
              ), '[]'::json
            ) AS rows;`,
        {
          type: QueryTypes.SELECT,
          bind: [postId, limit, (page - 1) * limit, userId],
        },
      );

    return { rows: plainToInstance(CommentResponseDto, rows), count };
  }
}
