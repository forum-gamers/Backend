import { IsInt, IsString, IsUrl, IsEnum, IsDate } from 'class-validator';

export class PostMediaResponse {
  @IsInt()
  id: number;

  @IsInt()
  postId: number;

  @IsUrl()
  url: string;

  @IsString()
  fileId: string;

  @IsEnum(['image', 'video'])
  type: 'image' | 'video';

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
