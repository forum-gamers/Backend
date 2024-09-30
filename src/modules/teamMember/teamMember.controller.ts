import {
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { BaseController } from 'src/base/controller.base';
import { UserMe } from '../user/decorators/me.decorator';
import { TeamMemberService } from './teamMember.service';
import { TeamFindByIdLocked } from '../team/pipes/findById.locked.pipe';
import { type TeamAttributes } from 'src/models/team';
import { CreateTeamMemberDto } from './dto/create.dto';
import { TeamFindById } from '../team/pipes/findById.pipe';
import { QueryPipe } from 'src/utils/pipes/query.pipe';
import * as yup from 'yup';
import type { BaseQuery } from 'src/interfaces/request.interface';
import { TeamService } from '../team/team.service';
import { Sequelize } from 'sequelize-typescript';

@Controller('team-member')
export class TeamMemberController extends BaseController {
  constructor(
    private readonly teamMemberService: TeamMemberService,
    private readonly teamService: TeamService,
    private readonly sequelize: Sequelize,
  ) {
    super();
  }

  @Post(':teamId')
  @HttpCode(201)
  public async joinTeam(
    @Param('teamId', ParseUUIDPipe, TeamFindByIdLocked)
    team: TeamAttributes | null,
    @UserMe('id') userId: string,
  ) {
    if (!team) throw new NotFoundException('Team not found');

    if (team.totalMember > team.maxMember)
      throw new HttpException('Team is full', HttpStatus.PAYMENT_REQUIRED);

    if (await this.teamMemberService.findByTeamIdAndUserId(team.id, userId))
      throw new ConflictException('you already joined this team');

    return await this.teamMemberService.create(
      new CreateTeamMemberDto({
        teamId: team.id,
        userId,
        status: false,
        role: 'member',
      }),
    );
  }

  @Delete(':teamId')
  @HttpCode(200)
  public async leaveTeam(
    @Param('teamId', ParseUUIDPipe, TeamFindByIdLocked)
    team: TeamAttributes | null,
    @UserMe('id') userId: string,
  ) {
    if (!team) throw new NotFoundException('team not found');
    if (team.owner === userId)
      throw new ConflictException('you cannot leave this team'); //pisahin endpoint

    const member = await this.teamMemberService.findByTeamIdAndUserId(
      team.id,
      userId,
    );
    if (!member) throw new NotFoundException('member not found');

    const transaction = await this.sequelize.transaction();
    try {
      const tasks: any[] = [
        this.teamMemberService.deleteByTeamIdAndUserId(team.id, userId, {
          transaction,
        }),
      ];
      if (member.status)
        tasks.push(
          this.teamService.updateTotalMember(team.id, +team.totalMember - 1, {
            transaction,
          }),
        );
      await Promise.all(tasks);
      await transaction.commit();
      return this.sendResponseBody({
        message: 'OK',
        code: 200,
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  @Get(':teamId')
  @HttpCode(200)
  public async findByTeamId(
    @Param('teamId', ParseUUIDPipe, TeamFindById)
    team: TeamAttributes | null,
    @UserMe('id') userId: string,
    @Query(
      new QueryPipe(1, 10, {
        q: yup.string().optional(),
        status: yup
          .bool()
          .transform(Boolean)
          .default(true)
          .nullable()
          .optional(),
      }),
    )
    {
      page,
      limit,
      q = null,
      status = true,
    }: BaseQuery & { q?: string; status: boolean },
  ) {
    if (!team || !team.isPublic) throw new NotFoundException('Team not found');
    if (!status && team.owner !== userId)
      throw new ForbiddenException('forbidden');

    const { totalData = 0, datas = [] } =
      await this.teamMemberService.findByTeamId(team.id, userId, {
        page,
        limit,
        q,
        status,
      });

    return this.sendResponseBody(
      {
        message: 'OK',
        code: 200,
        data: datas,
      },
      {
        totalData,
        totalPage: Math.ceil(totalData / limit),
        page,
        limit,
      },
    );
  }
}
