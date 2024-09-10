import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';

export class ReplyResponseDto {
  @IsInt()
  public id: number;

  @IsString()
  public userId: string;

  @IsInt()
  public commentId: number;

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
  public backgroundImageUrl: string;

  @IsString()
  public userCreatedAt: Date | string;

  @IsOptional()
  @IsString()
  public bio: string;
}
