import { Exclude } from 'class-transformer';

export class ExcludedUserFieldDto {
  @Exclude()
  password: string;

  @Exclude()
  searchVectorUsername: any;

  @Exclude()
  searchVectorBio: any;

  @Exclude()
  trgmSimilarityUsername: any;

  @Exclude()
  trgmSimilarityBio: any;
}
