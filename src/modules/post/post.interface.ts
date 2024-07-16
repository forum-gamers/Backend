import type { PostPrivacy } from 'src/interfaces/model.interface';

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
