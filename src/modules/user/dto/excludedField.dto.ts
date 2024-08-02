import { Exclude } from 'class-transformer';

export class ExcludedUserFieldDto {
  @Exclude()
  password: string;
}
