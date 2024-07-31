import { IsString, IsUrl, IsEnum } from 'class-validator';

export class PostMediaResponse {
  @IsUrl()
  url: string;

  @IsString()
  fileId: string;

  @IsEnum(['image', 'video'])
  type: 'image' | 'video';
}
