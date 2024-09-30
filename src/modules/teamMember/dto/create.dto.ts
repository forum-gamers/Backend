import type { TeamRole } from 'src/interfaces/model.interface';

export class CreateTeamMemberDto {
  teamId: string;
  userId: string;
  status: boolean;
  role: TeamRole;

  constructor({
    teamId,
    userId,
    status = false,
    role,
  }: CreateTeamMemberDtoProps) {
    this.teamId = teamId;
    this.userId = userId;
    this.status = status;
    this.role = role;
  }
}

export interface CreateTeamMemberDtoProps {
  teamId: string;
  userId: string;
  status?: boolean;
  role: TeamRole;
}
