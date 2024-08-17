export class CreateTeamMemberDto {
  teamId: string;
  userId: string;

  constructor({ teamId, userId }: CreateTeamMemberDtoProps) {
    this.teamId = teamId;
    this.userId = userId;
  }
}

export interface CreateTeamMemberDtoProps {
  teamId: string;
  userId: string;
}
