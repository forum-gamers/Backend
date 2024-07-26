import {
  type JwtPayload,
  sign,
  verify,
  type SignOptions,
  decode,
} from 'jsonwebtoken';
import { config } from 'dotenv';
import { UnauthorizedException } from '@nestjs/common';

config();

export interface TokenValue {
  id: string;
  isVerified: boolean;
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
}

const jwt = new Jwt();

export default jwt;
