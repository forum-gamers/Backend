import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BaseController } from 'src/base/controller.base';
import { CommunityEventService } from './communityEvent.service';
import { type CommunityAttributes } from 'src/models/community';
import { QueryPipe } from 'src/utils/pipes/query.pipe';
import * as yup from 'yup';
import { BaseQuery } from 'src/interfaces/request.interface';
import { COMMUNITY_EVENT_STATUS } from 'src/constants/event.constant';
import { type CommunityEventStatus } from 'src/models/communityevent';
import { CommunityContext } from '../community/decorators/community.decorator';
import { CommunityMembersAttributes } from 'src/models/communitymember';
import { CreateCommunityEventPipe } from './pipes/create.pipe';
import { CreateCommunityEventProps } from './communityEvent.interface';
import { RateLimitGuard } from 'src/middlewares/global/rateLimit.middleware';
import { UserMe } from '../user/decorators/me.decorator';
import { CreateCommunityEventDto } from './dto/create.dto';

@Controller('community-event')
export class CommunityEventController extends BaseController {
  constructor(private readonly communityEventService: CommunityEventService) {
    super();
  }

  @Get('community/:id')
  @HttpCode(200)
  public async getAll(
    @CommunityContext()
    {
      community,
      communityMember,
    }: {
      community: CommunityAttributes;
      communityMember: CommunityMembersAttributes;
    },
    @Query(
      new QueryPipe(1, 15, {
        q: yup.string().nullable().optional(),
        status: yup
          .string()
          .oneOf(COMMUNITY_EVENT_STATUS, 'invalid status')
          .default(null)
          .nullable()
          .optional(),
      }),
    )
    {
      page,
      limit,
      q,
      status,
    }: BaseQuery & { q?: string; status?: CommunityEventStatus },
    @UserMe('id') userId: string,
  ) {
    if (!community) throw new NotFoundException('community not found');

    const { rows, count } =
      await this.communityEventService.findAllByCommunityId(community.id, {
        page,
        limit,
        q,
        status,
        isMember: !!communityMember,
        userId: communityMember?.userId ?? userId,
      });

    return this.sendResponseBody(
      {
        message: 'OK',
        code: 200,
        data: rows,
      },
      {
        totalData: count,
        totalPage: Math.ceil(count / limit),
        page,
        limit,
      },
    );
  }

  @Post('community/:id')
  @HttpCode(201)
  @UseGuards(
    new RateLimitGuard({
      windowMs: 1 * 60 * 1000,
      max: 10,
      message: 'Too many requests from this IP, please try again in 1 minute.',
    }),
  )
  public async create(
    @CommunityContext()
    {
      community,
      communityMember,
    }: {
      community: CommunityAttributes;
      communityMember: CommunityMembersAttributes;
    },
    @Body(CreateCommunityEventPipe)
    {
      title,
      description,
      startTime,
      endTime = null,
      isPublic = true,
      location,
    }: CreateCommunityEventProps,
    @UserMe('id') userId: string,
  ) {
    if (!community) throw new NotFoundException('community not found');
    if (!communityMember?.role || communityMember?.role === 'member')
      throw new ForbiddenException('cannot create event');

    if (5 < (await this.communityEventService.countActiveEvent(community.id)))
      throw new ConflictException('cannot create more than 5 active event');

    return this.sendResponseBody({
      message: 'OK',
      code: 200,
      data: await this.communityEventService.create(
        new CreateCommunityEventDto({
          title,
          description,
          startTime,
          endTime,
          isPublic,
          location,
          createdBy: userId,
          communityId: community.id,
        }),
      ),
    });
  }
}
