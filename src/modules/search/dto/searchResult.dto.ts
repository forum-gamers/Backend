import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUrl,
  IsIn,
  ValidateNested,
} from 'class-validator';

export class SearchResultContextDto {
  @IsOptional()
  @IsNumber()
  public postId?: number;
}

export class SearchResultDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['user', 'post', 'comment', 'reply'])
  source: string;

  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsOptional()
  @IsUrl()
  imageUrl: string | null;

  @IsString()
  @IsNotEmpty()
  searchedField: string;

  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  rank: number;

  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  similarityScore: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => SearchResultContextDto)
  context?: SearchResultContextDto | null;
}
