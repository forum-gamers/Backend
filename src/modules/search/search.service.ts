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
            ts_rank(u."searchVector", plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) AS rank,
            similarity(u.username, $1) AS similarity_score
            FROM "Users" u
            WHERE (plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) @@ u."searchVector"
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
            ts_rank(u."searchVector", plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) AS rank,
            similarity(u.bio, $1) AS similarity_score
            FROM "Users" u
            WHERE (plainto_tsquery('english', $1) || plainto_tsquery('indonesian', $1)) @@ u."searchVector"
            OR u.bio % $1
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
        
        all_search_results AS (
            SELECT DISTINCT
                source,
                "id",
                text,
                "imageUrl",
                searched_field,
                rank,
                similarity_score
            FROM user_search_username
            UNION ALL
            SELECT DISTINCT
                source,
                "id",
                text,
                "imageUrl",
                searched_field,
                rank,
                similarity_score
            FROM user_search_bio
            UNION ALL
            SELECT DISTINCT
                source,
                "id",
                text,
                "imageUrl",
                searched_field,
                rank,
                similarity_score
            FROM post_search
            UNION ALL
            SELECT DISTINCT
                source,
                "id",
                text,
                "imageUrl",
                searched_field,
                rank,
                similarity_score
            FROM post_comment_search
            UNION ALL
            SELECT DISTINCT
                source,
                "id",
                text,
                "imageUrl",
                searched_field,
                rank,
                similarity_score
            FROM reply_comment_search
        ),
        
        total_count AS (
            SELECT COUNT(*) AS count FROM all_search_results
        )
        
        SELECT
        (SELECT json_agg(json_build_object(
            'source', source,
            'id', "id",
            'text', text,
            'imageUrl', "imageUrl",
            'searchedField', searched_field,
            'rank', rank,
            'similarityScore', similarity_score
        )) FROM all_search_results) AS datas,
        (SELECT count FROM total_count) AS "totalData";`,
        {
          type: QueryTypes.SELECT,
          bind: [q],
        },
      );
    return {
      datas: datas.map((el) => plainToInstance(SearchResultDto, el)),
      totalData: Number(totalData),
    };
  }
}
