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
            ts_rank(u."searchVectorUsername", plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) AS rank,
            similarity(u.username, $1) AS similarity_score
            FROM "Users" u
            WHERE (plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) @@ u."searchVectorUsername"
            OR u.username % $1
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
                ts_rank(u."searchVectorBio", plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) AS rank,
                similarity(u.bio, $1) AS similarity_score
            FROM "Users" u
            WHERE (plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) @@ u."searchVectorBio"
            OR u.bio ILIKE $1
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
            ts_rank(p."searchVector", plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) AS rank,
            similarity(p.text, $1) AS similarity_score
            FROM "Posts" p
            WHERE (plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) @@ p."searchVector"
            OR p.text % $1
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
            ts_rank(pc."searchVector", plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) AS rank,
            similarity(pc.text, $1) AS similarity_score
            FROM "PostComments" pc
            WHERE (plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) @@ pc."searchVector"
            OR pc.text % $1
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
            ts_rank(rc."searchVector", plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) AS rank,
            similarity(rc.text, $1) AS similarity_score
            FROM "ReplyComments" rc
            WHERE (plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) @@ rc."searchVector"
            OR rc.text % $1
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
            ts_rank(c."searchVectorName", plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) AS rank,
            similarity(c.name, $1) AS similarity_score
            FROM "Communities" c
            WHERE (plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) @@ c."searchVectorName"
            OR c.name % $1
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
            ts_rank(c."searchVectorDescription", plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) AS rank,
            similarity(c.description, $1) AS similarity_score
            FROM "Communities" c
            WHERE (plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) @@ c."searchVectorDescription"
            OR c.description % $1
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
                    'similarityScore', similarity_score
                ))
                FROM sorted_results
                ), '[]'
            ) AS datas,
            COALESCE(
                (SELECT count FROM total_count), 0
            ) AS "totalData";`,
        {
          type: QueryTypes.SELECT,
          bind: [q, 15, 0],
        },
      );
    return {
      datas: datas.map((el) => plainToInstance(SearchResultDto, el)),
      totalData: Number(totalData),
    };
  }
}
