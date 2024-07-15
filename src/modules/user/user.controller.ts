import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { BaseController } from '../../base/controller.base';
import { Sequelize } from 'sequelize-typescript';
import { UserService } from './user.service';
import { ImageKitService } from '../../third-party/imagekit/imagekit.service';
import { MailService } from '../../third-party/mail/mail.service';
import { UserValidation } from './user.validation';
import { GetByQueryPayload } from './dto/getByQueryPayload.dto';
import type { ICheckExisting } from './user.interface';
import jwt from '../../utils/jwt.utils';
import { WalletService } from '../wallet/wallet.service';
import { CreateWallet } from '../wallet/dto/createWallet.dto';
import { CreateUser } from './dto/create.dto';
import { RateLimitGuard } from '../../middlewares/global/rateLimit.middleware';
import encryption from '../../utils/encryption.utils';
import { UserFindByToken } from './pipes/findByToken.pipe';
import { type UserAttributes } from '../../models/user';

@Controller('user')
export class UserController extends BaseController {
  constructor(
    private readonly sequelize: Sequelize,
    private readonly userService: UserService,
    private readonly imagekitService: ImageKitService,
    private readonly mailService: MailService,
    private readonly userValidation: UserValidation,
    private readonly walletService: WalletService,
  ) {
    super();
  }

  @Post('register')
  @HttpCode(201)
  public async register(@Body() payload: any) {
    const { email, username, password, phoneNumber } =
      await this.userValidation.validateRegister(payload);

    const encrypted = new GetByQueryPayload<ICheckExisting>({
      email,
      username,
      phoneNumber,
    }) as ICheckExisting;
    const existing = await this.userService.getByQuery(encrypted);
    if (existing.length)
      for (const data of existing)
        switch (true) {
          case data.email === encrypted.email:
            throw new ConflictException(`email ${email} is already use`);
          case data.username === encrypted.username:
            throw new ConflictException(`username ${username} is already use`);
          case data.phoneNumber === encrypted.phoneNumber:
            throw new ConflictException(
              `phoneNumber ${phoneNumber} is already use`,
            );
          default:
            break;
        }

    const transaction = await this.sequelize.transaction();
    try {
      const user = await this.userService.createOne(
        new CreateUser({
          username,
          email,
          password,
          phoneNumber,
        }),
        { transaction },
      );
      await this.walletService.createWallet(new CreateWallet(user.id), {
        transaction,
      });

      const token = jwt.createToken({ id: user.id, isVerified: false });
      this.mailService.sendCofirmMail(email, token);

      await transaction.commit();
      return this.sendResponseBody({
        code: 201,
        message: 'User created successfully',
        data: { user: { ...user.dataValues, password: undefined }, token },
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
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
      await this.userValidation.validateLogin(payload);

    const user = await this.userService.findByEmail(email);
    if (!user || !(await encryption.compareEncryption(password, user.password)))
      throw new UnauthorizedException('invalid credentials');

    return this.sendResponseBody({
      code: 200,
      message: 'Login successful',
      data: jwt.createToken({ id: user.id, isVerified: user.isVerified }),
    });
  }

  @Patch('verify')
  @UseGuards(
    new RateLimitGuard({
      windowMs: 1 * 60 * 1000,
      max: 5,
      message: 'Too many requests from this IP, please try again in 1 minute.',
    }),
  )
  @HttpCode(200)
  public async verify(
    @Query('token', UserFindByToken) user: UserAttributes | null,
  ) {
    if (!user)
      throw new UnauthorizedException('missing or invalid authorization');
    if (user.isVerified) throw new ConflictException('user already verified');

    await this.userService.activatedUser(user.id);

    return this.sendResponseBody({
      message: 'user verified successfully',
      code: 200,
    });
  }
}
