import {
  ConflictException,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { BaseController } from 'src/base/controller.base';
import { UserMe } from '../user/decorators/me.decorator';
import { TeamMemberService } from './teamMember.service';
import { TeamFindByIdLocked } from '../team/pipes/findById.locked.pipe';
import { type TeamAttributes } from 'src/models/team';
import { CreateTeamMemberDto } from './dto/create.dto';

@Controller('team-member')
export class TeamMemberController extends BaseController {
  constructor(private readonly teamMemberService: TeamMemberService) {
    super();
  }

  @Patch(':teamId')
  @HttpCode(200)
  public async joinTeam(
    @Param('teamId', ParseUUIDPipe, TeamFindByIdLocked)
    team: TeamAttributes | null,
    @UserMe('id') userId: string,
  ) {
    if (!team) throw new NotFoundException('Team not found');

    if (await this.teamMemberService.findByTeamIdAndUserId(team.id, userId))
      throw new ConflictException('you already joined this team');

    return await this.teamMemberService.create(
      new CreateTeamMemberDto({
        teamId: team.id,
        userId,
      }),
    );
  }
}
