import {
  IsString,
  IsEmail,
  IsBoolean,
  IsDate,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { Exclude, Transform } from 'class-transformer';
import encryption from 'src/utils/global/encryption.utils';

export class UserDecryptedDto {
  @IsUUID()
  id: string;

  @IsString()
  username: string;

  @IsEmail()
  @Transform(({ value }) => encryption.decrypt(value))
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
  @Transform(({ value }) => encryption.decrypt(value))
  phoneNumber: string;
}
