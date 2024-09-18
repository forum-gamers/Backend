import { Injectable } from '@nestjs/common';
import { BaseThirdPartyRequest } from 'src/base/axios.base';
import { DISCORD_BASE_URL } from './discord.constant';
import type { DiscordGuild, DiscordUser } from './discord.interface';

@Injectable()
export class DiscordMeService extends BaseThirdPartyRequest {
  constructor() {
    super(DISCORD_BASE_URL);
  }

  public async getMe(discordToken: string) {
    return await this.Query<DiscordUser>({
      url: '/users/@me',
      headers: {
        Authorization: `Bearer ${discordToken}`,
      },
    });
  }

  public async getMyGuild(discordToken: string) {
    return await this.Query<DiscordGuild[]>({
      url: '/users/@me/guilds',
      headers: {
        Authorization: `Bearer ${discordToken}`,
      },
    });
  }
}
