export class CreateDiscordProfileDto {
  public id: string;
  public imageUrl?: string;
  public backgroundUrl?: string;
  public userId: string;
  public accessToken: string;
  public refreshToken: string;
  public tokenExpires: bigint;

  constructor({
    id,
    imageUrl,
    backgroundUrl,
    userId,
    accessToken,
    refreshToken,
    tokenExpires,
  }: CreateDiscordProfileDtoProps) {
    this.id = id;
    this.imageUrl = imageUrl;
    this.backgroundUrl = backgroundUrl;
    this.userId = userId;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.tokenExpires = tokenExpires;
  }
}

export interface CreateDiscordProfileDtoProps {
  id: string;
  imageUrl?: string;
  backgroundUrl?: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  tokenExpires: bigint;
}
