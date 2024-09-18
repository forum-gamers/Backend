export interface RequestTokenResponse {
  token_type: string;
  access_token: string;
  expires_in: number | bigint;
  refresh_token: string;
  scope: string; // example connections email guilds guilds.members.read applications.commands identify
}

export interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null; // use avatar url like this https://cdn.discordapp.com/avatars/{user_id}/{user_avatar}.{png} *
  discriminator: string;
  public_flags: number;
  flags: number;
  banner: string | null;
  accent_color: null;
  global_name: string;
  avatar_decoration_data: null;
  banner_color: null;
  clan: null;
  mfa_enabled: boolean;
  locale: string;
  premium_type: number;
  email: string;
  verified: boolean;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: null | string;
  banner: null | string;
  owner: boolean;
  permissions: string;
  features: string[];
}
