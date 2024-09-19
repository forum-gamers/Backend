import type { GetCommunityDto } from './dto/get.dto';

export interface ICreateCommunityProps {
  name?: string;
  description?: string;
  discordServerId?: string;
}

export interface IFileProps {
  file: Express.Multer.File;
}

export interface IGetCommunityDBResponse {
  datas: GetCommunityDto;
  totalData: number;
}
