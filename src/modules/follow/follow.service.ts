import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Follow, type FollowAttributes } from 'src/models/follow';
import { CreateFollowDto } from './dto/create.dto';
import { DestroyOptions, QueryTypes, type CreateOptions } from 'sequelize';
import { User } from 'src/models/user';
import { QueryParamsDto } from 'src/utils/dto/pagination.dto';
import { Sequelize } from 'sequelize-typescript';
import { FollowRecomendationDto } from './dto/followRecomendation.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FollowService {
  constructor(
    @InjectModel(Follow)
    private readonly followModel: typeof Follow,
    private readonly sequelize: Sequelize,
  ) {}

  public async findOne(followerId: string, followedId: string) {
    return await this.followModel.findOne({
      where: { followerId, followedId },
    });
  }

  public async create(
    payload: CreateFollowDto,
    opts?: CreateOptions<FollowAttributes>,
  ) {
    return await this.followModel.create(payload, opts);
  }

  public async deleteOne(
    { followerId, followedId }: CreateFollowDto,
    opts?: DestroyOptions<FollowAttributes>,
  ) {
    return await this.followModel.destroy({
      ...opts,
      where: { followerId, followedId },
    });
  }

  public async getFollowers(
    followedId: string,
    { page = 1, limit = 15 }: QueryParamsDto,
  ) {
    return await this.followModel.findAll({
      where: { followedId },
      include: [
        {
          model: User,
          as: 'follower',
          attributes: ['id', 'username', 'email', 'imageUrl'],
        },
      ],
      offset: (page - 1) * limit,
    });
  }

  public async getMyFollowings(
    followerId: string,
    { page = 1, limit = 15 }: QueryParamsDto,
  ) {
    return await this.followModel.findAll({
      where: { followerId },
      include: [
        {
          model: User,
          as: 'followed',
          attributes: ['id', 'username', 'email', 'imageUrl'],
        },
      ],
      offset: (page - 1) * limit,
    });
  }

  public async getRecomendation(
    userId: string,
    { page, limit }: QueryParamsDto,
  ) {
    const datas = await this.sequelize.query<FollowRecomendationDto>(
      `WITH
        non_followed_users AS (
          SELECT u.id AS "userId", u.username, u."imageUrl" AS "userImageUrl", u.bio AS "userBio", 'non_followed' AS source
          FROM "Users" u
          LEFT JOIN "Follows" f ON u.id = f."followedId" AND f."followerId" = $1
          WHERE f.id IS NULL AND u.id != $1
        ),

        user_preferences AS (
          SELECT up.tags
          FROM "UserPreferences" up
          WHERE up."userId" = $1
        ),

        user_communities AS (
          SELECT DISTINCT cm."communityId"
          FROM "CommunityMembers" cm
          WHERE cm."userId" = $1
        ),

        user_groups AS (
          SELECT DISTINCT rm."roomId"
          FROM "RoomMembers" rm
          WHERE rm."userId" = $1
        ),

        similar_tag_users AS (
          SELECT DISTINCT u.id AS "userId", u.username, u."imageUrl" AS "userImageUrl", u.bio AS "userBio", 'tag' AS source
          FROM "Users" u
          JOIN "UserPreferences" up ON u.id = up."userId"
          WHERE
            EXISTS (
              SELECT 1
              FROM unnest(up.tags) AS tag
              JOIN unnest((SELECT tags FROM user_preferences LIMIT 1)) AS user_tag
              ON tag = user_tag
              HAVING COUNT(*) * 1.0 / array_length((SELECT tags FROM user_preferences LIMIT 1), 1) >= 0.5
            )
        ),

        same_community_users AS (
          SELECT DISTINCT u.id AS "userId", u.username, u."imageUrl" AS "userImageUrl", u.bio AS "userBio", 'community' AS source
          FROM "Users" u
          JOIN "CommunityMembers" cm ON u.id = cm."userId"
          WHERE cm."communityId" IN (SELECT uc."communityId" FROM user_communities uc)
        ),

        same_group_users AS (
          SELECT DISTINCT u.id AS "userId", u.username, u."imageUrl" AS "userImageUrl", u.bio AS "userBio", 'group' AS source
          FROM "Users" u
          JOIN "RoomMembers" rm ON u.id = rm."userId"
          WHERE rm."roomId" IN (SELECT ug."roomId" FROM user_groups ug)
        ),

        recommended_users AS (
          SELECT "userId", username, "userImageUrl", "userBio", source
          FROM non_followed_users
          UNION
          SELECT "userId", username, "userImageUrl", "userBio", source
          FROM similar_tag_users
          UNION
          SELECT "userId", username, "userImageUrl", "userBio", source
          FROM same_community_users
          UNION
          SELECT "userId", username, "userImageUrl", "userBio", source
          FROM same_group_users
        ),

        follow_back_users AS (
          SELECT f."followerId" AS "userId"
          FROM "Follows" f
          WHERE f."followedId" = $1
        )

      SELECT
        ru."userId",
        ru.username,
        ru."userImageUrl",
        ru."userBio",
        ru.source AS o,
        CASE
          WHEN fbu."userId" IS NOT NULL THEN 'follower'
          ELSE 'non-follower'
        END AS "followerStatus"
      FROM recommended_users ru
      LEFT JOIN follow_back_users fbu ON ru."userId" = fbu."userId"
      WHERE ru."userId" NOT IN (
        SELECT f."followedId"
        FROM "Follows" f
        WHERE f."followerId" = $1
      )
      ORDER BY ru.username
      LIMIT $2 OFFSET $3;`,
      { type: QueryTypes.SELECT, bind: [userId, limit, (page - 1) * limit] },
    );
    return datas.map((el) => plainToInstance(FollowRecomendationDto, el));
  }
}
