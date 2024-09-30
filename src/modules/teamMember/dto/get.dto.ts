import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsString } from 'class-validator';
import type { TeamRole } from 'src/interfaces/model.interface';
import { BaseUserDto } from 'src/modules/user/dto/baseUser.dto';

export class GetTeamMemberDto extends BaseUserDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  public id: number;

  @IsString()
  public teamId: string;

  @IsBoolean()
  @Transform(({ value }) => Boolean(value))
  public status: boolean;

  @IsBoolean()
  @Transform(({ value }) => Boolean(value))
  public isJoined: boolean;

  @IsBoolean()
  @Transform(({ value }) => Boolean(value))
  public isFollowed: boolean;

  @IsString()
  @IsIn(['owner', 'member', 'coach', 'inspector', 'manager', 'admin'])
  public role: TeamRole;

  @IsString()
  public createdAt: Date | string;
}
