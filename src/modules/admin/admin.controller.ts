import {
  Body,
  ConflictException,
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
import { AdminMe } from './decorators/me.decorator';
import type { AdminAttributes } from 'src/models/admin';
import { CreateAdminDto } from './dto/create.dto';

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

  @Post('register')
  @UseGuards(
    new RateLimitGuard({
      windowMs: 1 * 60 * 1000,
      max: 10,
      message: 'Too many requests from this IP, please try again in 1 minute.',
    }),
  )
  @HttpCode(201)
  public async registerNewAdmin(
    @Body() payload: any,
    @AdminMe() admin: AdminAttributes,
  ) {
    const { email, password, fullname, division, role } =
      await this.adminValidation.validateCreateAdmin(payload);

    if (admin.division !== 'Director' && admin.division !== division)
      throw new UnauthorizedException(
        'cannot create new admin from diffrent division',
      );

    if (admin.role === 'Staff')
      throw new UnauthorizedException('staff cannot create new admin');

    if (await this.adminService.findOneByEmail(email))
      throw new ConflictException('admin already exist');

    const { dataValues } = await this.adminService.create(
      new CreateAdminDto({
        email,
        password,
        fullname,
        division,
        role,
      }),
    );

    return this.sendResponseBody({
      code: 201,
      message: 'success',
      data: {
        token: jwt.createTokenAdmin({
          id: dataValues.id,
          isVerified: true,
          isAdmin: true,
        }),
        data: dataValues,
      },
    });
  }
}
