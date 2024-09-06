import {
  Injectable,
  UnauthorizedException,
  type NestMiddleware,
} from '@nestjs/common';
import type { RequestHandler } from 'express';
import jwt from '../../utils/global/jwt.utils';
import { UserService } from '../../modules/user/user.service';
import { AdminService } from 'src/modules/admin/admin.service';

@Injectable()
export class UserAuthentication implements NestMiddleware {
  public use: RequestHandler = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer '))
      throw new UnauthorizedException('missing or invalid authorization');

    const [, token] = authorization.split(' ');
    if (!token)
      throw new UnauthorizedException('missing or invalid authorization');

    const decoded = jwt.decodeToken(token);
    if (!decoded)
      throw new UnauthorizedException('missing or invalid authorization');

    const { isAdmin = false } = decoded;

    const { id } = jwt[isAdmin ? 'verifyAdminToken' : 'verifyToken'](token);

    if (isAdmin) {
      const admin = await this.adminService.findOneById(id);
      if (!admin)
        throw new UnauthorizedException('missing or invalid authorization');

      req.admin = admin.dataValues;
    } else {
      const user = await this.userService.findOneById(id);
      if (!user)
        throw new UnauthorizedException('missing or invalid authorization');

      req.user = user.dataValues;
    }

    next();
  };

  constructor(
    private readonly userService: UserService,
    private readonly adminService: AdminService,
  ) {}
}
