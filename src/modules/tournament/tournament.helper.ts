import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CommunityMemberService } from '../communityMember/communityMember.service';
import { TournamentService } from './tournament.service';

@Injectable()
export class TournamentHelper {
  constructor(
    private readonly communityMemberService: CommunityMemberService,
    private readonly tournamentService: TournamentService,
  ) {}

  public async canMakeCommunityTour(
    communityId: number,
    userId: string,
    gameId: number,
  ) {
    const member = await this.communityMemberService.findByCommunityIdAndUserId(
      communityId,
      userId,
    );
    if (!member) throw new NotFoundException('member not found');

    if (!['admin', 'owner'].includes(member.role))
      throw new UnauthorizedException(
        'you are not allowed to create tournament in this community',
      );

    if (
      (
        await this.tournamentService.findActiveTourByCommunityId(
          communityId,
          gameId,
        )
      )?.length
    )
      throw new ConflictException('tournament already exist');
  }
}
