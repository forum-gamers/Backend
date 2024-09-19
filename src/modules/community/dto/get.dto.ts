import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, IsUrl } from 'class-validator';

export class GetCommunityDto {
  @IsInt()
  public id: number;

  @IsString()
  public name: string;

  @IsString()
  @IsOptional()
  public description?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  public imageUrl?: string;

  @IsString()
  @IsOptional()
  public imageId?: string;

  @IsBoolean()
  @Transform(({ value }) => Boolean(value))
  public isDiscordServer: boolean;

  @IsString()
  public owner: string;

  @IsInt()
  @Transform(({ value }) => Number(value))
  public totalMember: number;

  @IsInt()
  @Transform(({ value }) => Number(value))
  public totalPost: number;

  @IsString()
  public createdAt: string;

  @IsString()
  public updatedAt: string;

  @IsBoolean()
  @Transform(({ value }) => Boolean(value))
  public isMember: boolean;
}
