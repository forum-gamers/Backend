import {
  type JwtPayload,
  sign,
  verify,
  type SignOptions,
  decode,
} from 'jsonwebtoken';
import { config } from 'dotenv';
import { DiscordProfileAttributes } from 'src/models/discordprofile';

config();

export interface TokenValue {
  id: string;
  isVerified: boolean;
  isAdmin: boolean;
  discordData:
    | (Pick<DiscordProfileAttributes, 'id' | 'accessToken' | 'refreshToken'> & {
        tokenExpires: number;
      })
    | null;
}

export type TokenPayload = TokenValue & JwtPayload;

class Jwt {
  private readonly secret: string = process.env.SECRET;

  public verifyToken(token: string) {
    return verify(token, this.secret) as TokenPayload;
  }

  public createToken(payload: TokenValue, opts?: SignOptions) {
    return sign(payload, this.secret, opts);
  }

  public decodeToken(token: string) {
    return decode(token) as TokenPayload;
  }

  public createTokenAdmin(payload: TokenValue) {
    return sign(payload, process.env.ADMIN_SECRET);
  }

  public verifyAdminToken(token: string) {
    return verify(token, process.env.ADMIN_SECRET) as TokenPayload;
  }
}

const jwt = new Jwt();

export default jwt;
