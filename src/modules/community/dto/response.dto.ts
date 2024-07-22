import { IsDate, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CommunityResponse {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  imageUrl: string;

  @IsString()
  imageId: string;

  @IsString()
  owner: string;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}
