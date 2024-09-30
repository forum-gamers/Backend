import type { GetTeamMemberDto } from './dto/get.dto';

export interface TeamMemberDBResult {
  totalData: number;
  datas: GetTeamMemberDto[];
}
