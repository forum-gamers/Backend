import { Injectable } from '@nestjs/common';
import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { SearchAnythingResult } from './search.interface';
import { plainToInstance } from 'class-transformer';
import { SearchResultDto } from './dto/searchResult.dto';

@Injectable()
export class SearchService {
  constructor(private readonly sequelize: Sequelize) {}

  public async searchAnything(q: string) {
    const [{ datas, totalData }] =
      await this.sequelize.query<SearchAnythingResult>(
        `WITH
        user_search_username AS (
            SELECT
                'user' AS source,
                u.id::text AS "id",
                COALESCE(
                    ts_headline('english', u.username, plainto_tsquery('english', $1), 'StartSel = <b>, StopSel = </b>'),
                    ts_headline('indonesian', u.username, plainto_tsquery('indonesian', $1), 'StartSel = <b>, StopSel = </b>')
                ) AS text,
                u."imageUrl" AS "imageUrl",
                'username' AS searched_field,
                ROUND(GREATEST(1, (ts_rank(u."searchVectorUsername", plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) + 0.5) * 100)) AS rank,
                ROUND(GREATEST(1, similarity(u.username, $1) * 100)) AS similarity_score,
                NULL::jsonb AS context
            FROM "Users" u
            WHERE (plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) @@ u."searchVectorUsername"
            OR u.username % $1
            OR u.username ILIKE '%' || $1 || '%'
            AND similarity(u.username, $1) > 0.5 AND u.status = 'active' AND u."isBlocked" = false
        ),
        user_search_bio AS (
            SELECT 
                'user' AS source,
                u.id::text AS "id",
                COALESCE(
                    ts_headline('english', u.bio, plainto_tsquery('english', $1), 'StartSel = <b>, StopSel = </b>'),
                    ts_headline('indonesian', u.bio, plainto_tsquery('indonesian', $1), 'StartSel = <b>, StopSel = </b>')
                ) AS text,
                u."imageUrl" AS "imageUrl",
                'bio' AS searched_field,
                ROUND(GREATEST(1, ts_rank(u."searchVectorBio", plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) * 100)) AS rank,
                ROUND(GREATEST(1, similarity(u.bio, $1) * 100)) AS similarity_score,
                NULL::jsonb AS context
            FROM "Users" u
            WHERE (plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) @@ u."searchVectorBio"
            OR u.bio ILIKE '%' || $1 || '%'
            AND similarity(u.bio, $1) > 0.3 AND u.status = 'active' AND u."isBlocked" = false
        ),  
        post_search AS (
            SELECT
                'post' AS source,
                p.id::text AS "id",
                COALESCE(
                    ts_headline('english', p.text, plainto_tsquery('english', $1), 'StartSel = <b>, StopSel = </b>'),
                    ts_headline('indonesian', p.text, plainto_tsquery('indonesian', $1), 'StartSel = <b>, StopSel = </b>')
                ) AS text,
                NULL AS "imageUrl",
                'text' AS searched_field,
                ROUND(GREATEST(1, ts_rank(p."searchVector", plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) * 100)) AS rank,
                ROUND(GREATEST(1, similarity(p.text, $1) * 100)) AS similarity_score,
                jsonb_build_object('postId', p.id) AS context
            FROM "Posts" p
            WHERE (plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) @@ p."searchVector"
            OR p.text % $1
            OR p.text ILIKE '%' || $1 || '%'
            AND similarity(p.text, $1) > 0.3 AND p."isBlocked" = false
        ),
        post_comment_search AS (
            SELECT
            'comment' AS source,
            pc.id::text AS "id",
            COALESCE(
                ts_headline('english', pc.text, plainto_tsquery('english', $1), 'StartSel = <b>, StopSel = </b>'),
                ts_headline('indonesian', pc.text, plainto_tsquery('indonesian', $1), 'StartSel = <b>, StopSel = </b>')
            ) AS text,
            NULL AS "imageUrl",
            'text' AS searched_field,
            ROUND(GREATEST(1, ts_rank(pc."searchVector", plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) * 100)) AS rank,
            ROUND(GREATEST(1, similarity(pc.text, $1) * 100)) AS similarity_score,
            jsonb_build_object('postId', p.id) AS context
            FROM "PostComments" pc
            JOIN "Posts" p ON pc."postId" = p.id
            WHERE (plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) @@ pc."searchVector"
            OR pc.text % $1
            OR pc.text ILIKE '%' || $1 || '%'
            AND similarity(pc.text, $1) > 0.3 AND p."isBlocked" = false
        ),
        reply_comment_search AS (
            SELECT
                'reply' AS source,
                rc.id::text AS "id",
                COALESCE(
                    ts_headline('english', rc.text, plainto_tsquery('english', $1), 'StartSel = <b>, StopSel = </b>'),
                    ts_headline('indonesian', rc.text, plainto_tsquery('indonesian', $1), 'StartSel = <b>, StopSel = </b>')
                ) AS text,
                NULL AS "imageUrl",
                'text' AS searched_field,
                ROUND(GREATEST(1, ts_rank(rc."searchVector", plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) * 100)) AS rank,
                ROUND(GREATEST(1, similarity(rc.text, $1) * 100)) AS similarity_score,
                jsonb_build_object('postId', p.id) AS context
            FROM "ReplyComments" rc
            JOIN "Posts" p ON rc."postId" = p.id
            WHERE (plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) @@ rc."searchVector"
            OR rc.text % $1
            OR rc.text ILIKE '%' || $1 || '%'
            AND similarity(rc.text, $1) > 0.3
            AND p."isBlocked" = false
        ),
        community_name_search AS (
            SELECT
                'community' AS source,
                c.id::text AS "id",
                COALESCE(
                    ts_headline('english', c.name, plainto_tsquery('english', $1), 'StartSel = <b>, StopSel = </b>'),
                    ts_headline('indonesian', c.name, plainto_tsquery('indonesian', $1), 'StartSel = <b>, StopSel = </b>')
                ) AS text,
                c."imageUrl" AS "imageUrl",
                'name' AS searched_field,
                ROUND(GREATEST(1, (ts_rank(c."searchVectorName", plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) + 0.5) * 100)) AS rank,
                ROUND(GREATEST(1, similarity(c.name, $1) * 100)) AS similarity_score,
                NULL::jsonb AS context
            FROM "Communities" c
            WHERE (plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) @@ c."searchVectorName"
            OR c.name % $1
            OR c.name ILIKE '%' || $1 || '%'
            AND similarity(c.name, $1) > 0.5
        ),
        community_description_search AS (
            SELECT
                'community' AS source,
                c.id::text AS "id",
                COALESCE(
                    ts_headline('english', c.description, plainto_tsquery('english', $1), 'StartSel = <b>, StopSel = </b>'),
                    ts_headline('indonesian', c.description, plainto_tsquery('indonesian', $1), 'StartSel = <b>, StopSel = </b>')
                ) AS text,
                c."imageUrl" AS "imageUrl",
                'description' AS searched_field,
                ROUND(GREATEST(1, ts_rank(c."searchVectorDescription", plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) * 100)) AS rank,
                ROUND(GREATEST(1, similarity(c.description, $1) * 100)) AS similarity_score,
                NULL::jsonb AS context
            FROM "Communities" c
            WHERE (plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) @@ c."searchVectorDescription"
            OR c.description % $1
            OR c.description ILIKE '%' || $1 || '%'
            AND similarity(c.description, $1) > 0.3
        ),
        all_search_results AS (
            SELECT * FROM user_search_username
            UNION ALL
            SELECT * FROM user_search_bio
            UNION ALL
            SELECT * FROM post_search
            UNION ALL
            SELECT * FROM post_comment_search
            UNION ALL
            SELECT * FROM reply_comment_search
            UNION ALL
            SELECT * FROM community_name_search
            UNION ALL
            SELECT * FROM community_description_search
            ),
            total_count AS (
                SELECT COUNT(*) AS count FROM all_search_results
            ),
            sorted_results AS (
                SELECT *
                FROM all_search_results
                ORDER BY rank DESC, similarity_score DESC
                LIMIT $2 OFFSET $3
            )

            SELECT 
            COALESCE(
                (
                SELECT json_agg(json_build_object(
                    'source', source,
                    'id', "id",
                    'text', text,
                    'imageUrl', "imageUrl",
                    'searchedField', searched_field,
                    'rank', rank,
                    'similarityScore', similarity_score,
                    'context', context
                ))
                FROM sorted_results
                ), '[]'
            ) AS datas,
            COALESCE(
                (SELECT count FROM total_count), 0
            ) AS "totalData";`,
        {
          type: QueryTypes.SELECT,
          bind: [q, 10, 0],
        },
      );
    return {
      datas: datas.map((el) => plainToInstance(SearchResultDto, el)),
      totalData: Number(totalData),
    };
  }
}
