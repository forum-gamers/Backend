import 'dotenv/config';
import { Injectable } from '@nestjs/common';
import { BaseThirdPartyRequest } from 'src/base/axios.base';
import type { RequestTokenResponse } from './discord.interface';
import { DISCORD_BASE_URL } from './discord.constant';

@Injectable()
export class DiscordOauthService extends BaseThirdPartyRequest {
  constructor() {
    super(DISCORD_BASE_URL);
  }

  public async requestToken(code: string) {
    return await this.Mutation<RequestTokenResponse>({
      method: 'POST',
      url: '/oauth2/token',
      data: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.PUBLIC_APP_URL}/discord/callback`, // <- uri yang di pakai utk authorization dari fe
        client_id: process.env.DISCORD_CLIENTID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
      }).toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      auth: {
        username: process.env.DISCORD_CLIENTID,
        password: process.env.DISCORD_CLIENT_SECRET,
      },
    });
  }

  public async refreshToken(refresh_token: string) {
    return await this.Mutation<RequestTokenResponse>({
      method: 'POST',
      url: '/oauth2/token',
      data: {
        grant_type: 'refresh_token',
        refresh_token,
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      auth: {
        username: process.env.DISCORD_CLIENTID,
        password: process.env.DISCORD_CLIENT_SECRET,
      },
    });
  }
}
