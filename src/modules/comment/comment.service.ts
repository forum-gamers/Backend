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
    {
      page = 1,
      limit = 10,
      sortDirection = 'DESC',
      sortby = 'createdAt',
    }: QueryParamsDto,
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
              u.bio,
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
                    'imageUrl', ru."imageUrl",
                    'bio', ru.bio
                  )
                )
                FROM "ReplyComments" r
                JOIN "Users" ru ON r."userId" = ru.id
                WHERE r."commentId" = c.id
              ), '[]'::json) AS replies
            FROM "PostComments" c
            JOIN "Users" u ON c."userId" = u.id
            WHERE c."postId" = $1
            ORDER BY c."${sortby}" ${sortDirection}
            LIMIT $2 OFFSET $3
          )
          SELECT
            (SELECT COUNT(*) FROM "PostComments" WHERE "postId" = $1) AS count,
            json_agg(json_build_object(
              'id', c.id,
              'userId', c."userId", 
              'postId', c."postId",
              'text', c.text,
              'createdAt', c."createdAt",
              'updatedAt', c."updatedAt",
              'username', c.username,
              'imageUrl', c."imageUrl",
              'bio', c.bio,
              'replies', c.replies
            )) AS rows
          FROM comments_cte c;`,
        { type: QueryTypes.SELECT, bind: [postId, limit, (page - 1) * limit] },
      );

    return { rows: plainToInstance(CommentResponseDto, rows), count };
  }
}
