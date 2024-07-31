import { CommunityResponse } from 'src/modules/community/dto/response.dto';
import { PostMediaResponse } from 'src/modules/postMedia/dto/mediaResponse.dto';
import {
  IsInt,
  IsString,
  IsBoolean,
  IsDate,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class PostResponse {
  @IsInt()
  id: number;

  @IsString()
  userId: string;

  @IsString()
  text: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PostMediaResponse)
  medias: PostMediaResponse[];

  @IsBoolean()
  allowComment: boolean;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsString()
  privacy: string;

  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  countLike: number;

  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  countComment: number;

  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  countShare: number;

  @IsBoolean()
  isLiked: boolean;

  @IsBoolean()
  isShared: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => CommunityResponse)
  community: CommunityResponse | null;

  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  userImageUrl: string;

  @IsOptional()
  @IsString()
  userBio: string;
}
