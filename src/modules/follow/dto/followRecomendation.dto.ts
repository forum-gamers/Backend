import { IsString, IsIn } from 'class-validator';
import { BaseUserDto } from 'src/modules/user/dto/baseUser.dto';
import type { FollowStatus } from '../follow.interface';

export class FollowRecomendationDto extends BaseUserDto {
  @IsString()
  public source: string;

  @IsString()
  @IsIn(['non-follower', 'follower'])
  public followerStatus: FollowStatus;
}
