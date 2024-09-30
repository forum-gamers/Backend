import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, IsUrl } from 'class-validator';

export class GetTeamDto {
  @IsString()
  public id: string;

  @IsString()
  public name: string;

  @IsString()
  public description?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  public imageUrl?: string;

  @IsString()
  public owner: string;

  @IsInt()
  @Transform(({ value }) => Number(value))
  public totalMember: number;

  @IsInt()
  @Transform(({ value }) => Number(value))
  public gameId: number;

  @IsInt()
  @Transform(({ value }) => Number(value))
  public maxMember: number;

  @IsBoolean()
  @Transform(({ value }) => Boolean(value))
  public isPublic: boolean;

  @IsBoolean()
  @Transform(({ value }) => Boolean(value))
  public status: boolean;

  @IsBoolean()
  @Transform(({ value }) => Boolean(value))
  public isJoined: boolean;

  @IsString()
  public createdAt: string;

  @IsString()
  public gameName: string;

  @IsString()
  public gameImageUrl: string;

  @IsString()
  public gameCode: string;

  @IsString()
  public ownerUsername: string;

  @IsOptional()
  @IsString()
  public ownerImageUrl: string;

  @IsOptional()
  @IsString()
  public ownerBio: string;

  @IsString()
  public ownerCreatedAt: string;

  @IsOptional()
  @IsString()
  public ownerBackgroundImageUrl: string;
}
