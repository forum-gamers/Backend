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

  public verifyToken(token: string, message = 'missing or invalid token') {
    try {
      return verify(token, process.env.SECRET) as TokenPayload;
    } catch (err) {
      throw new UnauthorizedException(message);
    }
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
