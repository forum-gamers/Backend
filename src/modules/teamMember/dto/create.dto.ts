export class CreateTeamMemberDto {
  teamId: string;
  userId: string;
  status: boolean;

  constructor({ teamId, userId, status = false }: CreateTeamMemberDtoProps) {
    this.teamId = teamId;
    this.userId = userId;
    this.status = status;
  }
}

export interface CreateTeamMemberDtoProps {
  teamId: string;
  userId: string;
  status?: boolean;
}
