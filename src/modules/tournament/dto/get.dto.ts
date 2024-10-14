import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import type { TournamentStatus } from 'src/interfaces/model.interface';
import { GetCommunityDto } from 'src/modules/community/dto/get.dto';
import { BaseUserDto } from 'src/modules/user/dto/baseUser.dto';
import { IsNotNaN } from 'src/utils/decorators/IsNotNaN.decorator';

export class GetTournamentDto {
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  @IsNotNaN()
  id: number;

  @IsString()
  public name: string;

  @IsInt()
  @Transform(({ value }) => parseInt(value))
  @IsNotNaN()
  public gameId: number;

  @IsString()
  public gameName: string;

  @IsInt()
  @Transform(({ value }) => parseInt(value))
  @IsNotNaN()
  public pricePool: number;

  @IsInt()
  @Transform(({ value }) => parseInt(value))
  @IsNotNaN()
  public participantsTotal: number;

  @IsInt()
  @Transform(({ value }) => parseInt(value))
  @IsNotNaN()
  public slot: number;

  @IsString()
  @Transform(({ value }) => new Date(value).toISOString())
  public startDate: string | Date;

  @IsInt()
  @Transform(({ value }) => parseInt(value))
  @IsNotNaN()
  public registrationFee: number;

  @IsString()
  @IsOptional()
  public description?: string;

  @IsString()
  @IsUrl()
  public imageUrl: string;

  @IsString()
  @Transform(({ value }) => new Date(value).toISOString())
  public createdAt: string | Date;

  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => BaseUserDto)
  public user?: BaseUserDto;

  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => GetCommunityDto)
  community?: GetCommunityDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : []))
  @Type(() => String)
  public tags: string[];

  @IsString()
  location: string;

  @IsString()
  @IsOptional()
  public liveOn?: string;

  @IsBoolean()
  @Transform(({ value }) => Boolean(value))
  public isPublic: boolean;

  @IsString()
  @IsIn(['preparation', 'started', 'finished', 'cancel'])
  public status: TournamentStatus;
}
