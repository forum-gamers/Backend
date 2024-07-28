import {
  IsString,
  IsEmail,
  IsBoolean,
  IsDate,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { Exclude, Transform } from 'class-transformer';

export class UserDecryptedDto {
  @IsUUID()
  id: string;

  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @Exclude()
  password: string;

  @IsBoolean()
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

  @IsString()
  phoneNumber: string;
}
