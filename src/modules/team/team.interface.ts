import type { GetTeamDto } from './dto/get.dto';

export interface CreateTeamProps {
  name: string;
  description?: string;
  isPublic: boolean;
}

export interface GetTeamQueryDB {
  datas: GetTeamDto[];
  totalData: number;
}
