import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  type CountOptions,
  type CreateOptions,
  type FindAndCountOptions,
  Op,
  type WhereOptions,
  literal,
} from 'sequelize';
import { BaseQuery } from 'src/interfaces/request.interface';
import {
  CommunityEvent,
  type CommunityEventStatus,
  type CommunityEventAttributes,
} from 'src/models/communityevent';
import { User } from 'src/models/user';
import { CreateCommunityEventDto } from './dto/create.dto';

@Injectable()
export class CommunityEventService {
  constructor(
    @InjectModel(CommunityEvent)
    private readonly model: typeof CommunityEvent,
  ) {}

  public async findAllByCommunityId(
    communityId: number,
    {
      page = 1,
      limit = 15,
      q,
      status,
      isMember = false,
      userId = null,
    }: BaseQuery & {
      q?: string;
      status?: CommunityEventStatus;
      isMember: boolean;
      userId?: string;
    },
    opts?: FindAndCountOptions<CommunityEventAttributes>,
  ) {
    let where: WhereOptions<CommunityEventAttributes> = { communityId };
    if (q)
      where = {
        ...where,
        [Op.or]: [
          { title: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } },
        ],
      };

    if (status) where = { ...where, status };

    if (!isMember) where = { ...where, isPublic: true };

    return await this.model.findAndCountAll({
      ...opts,
      where,
      offset: (page - 1) * limit,
      limit,
      order: [
        ['createdAt', 'DESC'],
        ['startTime', 'DESC'],
      ],
      include: [
        {
          model: User,
          attributes: [
            'id',
            'username',
            'bio',
            'imageUrl',
            ['backgroundImageUrl', 'backgroundUrl'],
            'createdAt',
            [
              literal(
                `(SELECT COUNT(*) FROM "Follows" WHERE "followedId" = creator.id AND "followerId" = '${userId}') > 0`,
              ),
              'isFollowed',
            ],
          ],
          as: 'creator',
        },
      ],
    });
  }

  public async countActiveEvent(
    communityId: number,
    opts?: CountOptions<CommunityEventAttributes>,
  ) {
    return await this.model.count({
      ...opts,
      where: {
        communityId,
        status: 'scheduled',
      },
    });
  }

  public async create(
    payload: CreateCommunityEventDto,
    opts?: CreateOptions<CommunityEventAttributes>,
  ) {
    return await this.model.create(payload, opts);
  }
}
