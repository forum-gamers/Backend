import {
  ConflictException,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BaseController } from 'src/base/controller.base';
import { CommunityFindByIdPipe } from '../community/pipes/findById.pipe';
import { type CommunityAttributes } from 'src/models/community';
import { RateLimitGuard } from 'src/middlewares/global/rateLimit.middleware';
import { UserMe } from '../user/decorators/me.decorator';
import { CommunityMemberService } from './communityMember.service';
import { CreateCommunityMemberDto } from './dto/create.dto';

@Controller('community-member')
export class CommunityMemberController extends BaseController {
  constructor(private readonly communityMemberService: CommunityMemberService) {
    super();
  }

  @Post(':communityId')
  @HttpCode(201)
  @UseGuards(
    new RateLimitGuard({
      windowMs: 5 * 60 * 1000,
      max: 10,
      message: 'Too many requests from this IP, please try again in 5 minutes.',
    }),
  )
  public async create(
    @Param('communityId', ParseIntPipe, CommunityFindByIdPipe)
    community: CommunityAttributes | null,
    @UserMe('id') userId: string,
  ) {
    if (!community) throw new NotFoundException('community not found');
    if (
      community.owner === userId ||
      (await this.communityMemberService.findByCommunityIdAndUserId(
        community.id,
        userId,
      ))
    )
      throw new ConflictException('already joined');

    return this.sendResponseBody({
      message: 'OK',
      code: 200,
      data: await this.communityMemberService.create(
        new CreateCommunityMemberDto({
          userId,
          communityId: community.id,
          role: 'member',
        }),
      ),
    });
  }

  @Delete(':communityId')
  @HttpCode(200)
  @UseGuards(
    new RateLimitGuard({
      windowMs: 5 * 60 * 1000,
      max: 10,
      message: 'Too many requests from this IP, please try again in 5 minutes.',
    }),
  )
  public async delete(
    @Param('communityId', ParseIntPipe, CommunityFindByIdPipe)
    community: CommunityAttributes | null,
    @UserMe('id') userId: string,
  ) {
    if (!community) throw new NotFoundException('community not found');
    if (community.owner === userId)
      throw new ConflictException('owner cannot leave community');

    if (
      !(await this.communityMemberService.findByCommunityIdAndUserId(
        community.id,
        userId,
      ))
    )
      throw new NotFoundException('member not found');

    await this.communityMemberService.deleteByCommunityIdAndUserId(
      community.id,
      userId,
    );

    return this.sendResponseBody({
      message: 'OK',
      code: 200,
    });
  }
}
