export interface CreateTournamentParticipantDtoProps {
  tournamentId: number;
  teamId: string;
  status: boolean;
}

export class CreateTournamentParticipantDto {
  public readonly tournamentId: number;
  public readonly teamId: string;
  public readonly status: boolean;

  constructor({
    tournamentId,
    teamId,
    status,
  }: CreateTournamentParticipantDtoProps) {
    this.tournamentId = tournamentId;
    this.teamId = teamId;
    this.status = status;
  }
}
