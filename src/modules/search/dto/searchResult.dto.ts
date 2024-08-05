import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUrl,
  IsIn,
} from 'class-validator';

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
  similarity_score: number;
}
