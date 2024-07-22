import {
  Injectable,
  UnauthorizedException,
  type NestMiddleware,
} from '@nestjs/common';
import type { RequestHandler } from 'express';
import jwt from '../../utils/global/jwt.utils';
import { UserService } from '../../modules/user/user.service';

@Injectable()
export class UserAuthentication implements NestMiddleware {
  public use: RequestHandler = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization)
      throw new UnauthorizedException('missing or invalid authorization');

    if (!authorization.startsWith('Bearer '))
      throw new UnauthorizedException('missing or invalid authorization');

    const [, token] = authorization.split(' ');
    if (!token)
      throw new UnauthorizedException('missing or invalid authorization');

    const { id } = jwt.verifyToken(token);

    const user = await this.userService.findOneById(id);
    if (!user)
      throw new UnauthorizedException('missing or invalid authorization');

    req.user = user;
    next();
  };

  constructor(private readonly userService: UserService) {}
}
