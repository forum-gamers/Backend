import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ReplyResponseDto } from 'src/modules/reply/dto/replyResponse.dto';

export class CommentResponseDto {
  @IsInt()
  public id: number;

  @IsString()
  public userId: string;

  @IsInt()
  public postId: number;

  @IsString()
  public text: string;

  @IsDate()
  public createdAt: Date;

  @IsDate()
  public updatedAt: Date;

  @IsString()
  public username: string;

  @IsOptional()
  @IsString()
  public imageUrl: string;

  @IsOptional()
  @IsString()
  public bio: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReplyResponseDto)
  public replies: ReplyResponseDto[];
}
