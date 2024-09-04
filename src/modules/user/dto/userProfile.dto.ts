import {
  IsString,
  IsEmail,
  IsBoolean,
  IsDate,
  IsUUID,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ExcludedUserFieldDto } from './excludedField.dto';
import { Transform } from 'class-transformer';

export class UserProfileDto extends ExcludedUserFieldDto {
  @IsUUID()
  id: string;

  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsBoolean()
  @Transform(({ value }) =>
    typeof value === 'string' ? value === 'true' : Boolean(value),
  )
  isVerified: boolean;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  imageId?: string;

  @IsOptional()
  @IsString()
  backgroundImageUrl?: string;

  @IsOptional()
  @IsString()
  backgroundImageId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  followersCount: number;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  followingCount: number;

  @IsBoolean()
  @Transform(({ value }) => Boolean(value))
  isFollower: boolean;
}
