import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ExcludedUserFieldDto } from './excludedField.dto';

export class BaseUserDto extends ExcludedUserFieldDto {
  @IsUUID()
  @IsString()
  userId: string;

  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  userImageUrl: string;

  @IsOptional()
  @IsString()
  userBio: string;

  @IsString()
  userCreatedAt: Date | string;

  @IsOptional()
  @IsString()
  userBackgroundImageUrl: string;
}
