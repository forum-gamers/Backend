import 'dotenv/config';
import { Injectable } from '@nestjs/common';
import {
  type LoginTicket,
  OAuth2Client,
  type TokenPayload,
} from 'google-auth-library';

@Injectable()
export class GoogleOauthService {
  private readonly oauth2Client: OAuth2Client = new OAuth2Client(
    process.env.GOOGLE_OAUTH_CLIENTID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  );

  public async verifyIdToken(idToken: string) {
    return (await this.oauth2Client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_OAUTH_CLIENTID,
    })) as LoginTicket & { getPayload: () => TokenPayload };
  }
}
