export interface UpdateDiscordProfileProps {
  imageUrl?: string;
  backgroundUrl?: string;
  accessToken: string;
  refreshToken: string;
  tokenExpires: bigint;
}
