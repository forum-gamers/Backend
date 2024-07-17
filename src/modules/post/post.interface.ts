import type { PostPrivacy } from 'src/interfaces/model.interface';
import type { PostResponse } from './dto/postResponse.dto';

export interface IPostVideoProps {
  files: Express.Multer.File[];
}

export interface IPostPayloadProps {
  text?: string;
  allowComment: boolean;
  privacy: PostPrivacy;
  communityId?: number;
}

export interface IEditTextProps {
  text: string | null;
}

export interface PostResponseQueryDB {
  datas: PostResponse[];
  totalData: number;
}
