import {
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { BaseController } from 'src/base/controller.base';
import { AdminService } from './admin.service';
import { AdminValidation } from './admin.validation';
import encryption from 'src/utils/global/encryption.utils';
import jwt from 'src/utils/global/jwt.utils';
import { RateLimitGuard } from 'src/middlewares/global/rateLimit.middleware';

@Controller('admin')
export class AdminController extends BaseController {
  constructor(
    private readonly adminService: AdminService,
    private readonly adminValidation: AdminValidation,
  ) {
    super();
  }

  @Post('login')
  @UseGuards(
    new RateLimitGuard({
      windowMs: 1 * 60 * 1000,
      max: 10,
      message: 'Too many requests from this IP, please try again in 1 minute.',
    }),
  )
  @HttpCode(200)
  public async login(@Body() payload: any) {
    const { email, password } =
      await this.adminValidation.validateLogin(payload);

    const admin = await this.adminService.findOneByEmail(email);
    if (
      !admin ||
      !(await encryption.compareEncryption(password, admin.password))
    )
      throw new UnauthorizedException('Invalid email or password');

    return this.sendResponseBody({
      code: 200,
      message: 'success',
      data: jwt.createTokenAdmin({
        id: admin.id,
        isVerified: true,
        isAdmin: true,
      }),
    });
  }
}
