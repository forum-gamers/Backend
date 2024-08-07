import {
  BadGatewayException,
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BaseController } from '../../base/controller.base';
import { Sequelize } from 'sequelize-typescript';
import { UserService } from './user.service';
import { ImageKitService } from '../../third-party/imagekit/imagekit.service';
import { MailService } from '../../third-party/mail/mail.service';
import { UserValidation } from './user.validation';
import jwt from '../../utils/global/jwt.utils';
import { WalletService } from '../wallet/wallet.service';
import { CreateWallet } from '../wallet/dto/createWallet.dto';
import { CreateUser } from './dto/create.dto';
import { RateLimitGuard } from '../../middlewares/global/rateLimit.middleware';
import encryption from '../../utils/global/encryption.utils';
import { UserFindByTokenPipe } from './pipes/findByToken.pipe';
import { type UserAttributes } from '../../models/user';
import { UserMe } from './decorators/me.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { USER_BACKGROUND_FOLDER, USER_PROFILE_FOLDER } from './user.constant';
import { UserFindByIdPipe } from './pipes/findById.pipe';
import { ProfileViewerService } from '../profileViewer/profileViewer.service';
import { CreateProfileViewerDto } from '../profileViewer/dto/create.dto';
import { plainToInstance } from 'class-transformer';
import { UserDecryptedDto } from './dto/userDecrypted.dto';
import { User } from 'src/models/user';

@Controller('user')
export class UserController extends BaseController {
  constructor(
    private readonly sequelize: Sequelize,
    private readonly userService: UserService,
    private readonly imagekitService: ImageKitService,
    private readonly mailService: MailService,
    private readonly userValidation: UserValidation,
    private readonly walletService: WalletService,
    private readonly profileViewerService: ProfileViewerService,
  ) {
    super();
  }

  @Post('register')
  @HttpCode(201)
  public async register(@Body() payload: any) {
    const { email, username, password, phoneNumber } =
      await this.userValidation.validateRegister(payload);

    const existing = await this.userService.getByQuery({
      email,
      phoneNumber,
      username,
    });
    if (existing.length)
      for (const data of existing)
        switch (true) {
          case data.email === email:
            throw new ConflictException(`email ${email} is already use`);
          case data.username === username:
            throw new ConflictException(`username ${username} is already use`);
          case data.phoneNumber === phoneNumber:
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

      const token = jwt.createToken({
        id: user.id,
        isVerified: false,
        isAdmin: false,
      });
      this.mailService.sendConfirmMail(email, token);

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
    const { identifier, password } =
      await this.userValidation.validateLogin(payload);

    const user = await this.userService.findByIdentifier(identifier);
    if (
      !user ||
      !(await encryption.compareEncryption(password, user.password)) ||
      !user.isBlocked
    )
      throw new UnauthorizedException('invalid credentials');

    return this.sendResponseBody({
      code: 200,
      message: 'Login successful',
      data: jwt.createToken({
        id: user.id,
        isVerified: user.isVerified,
        isAdmin: false,
      }),
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
    @Query('token', UserFindByTokenPipe) user: UserAttributes | null,
  ) {
    if (!user)
      throw new UnauthorizedException('missing or invalid authorization');
    if (user.isVerified) throw new ConflictException('user already verified');
    if (!user.isBlocked) throw new ConflictException('user is blocked');

    await this.userService.activatedUser(user.id);

    return this.sendResponseBody({
      message: 'user verified successfully',
      code: 200,
    });
  }

  @Post('resend-email')
  @UseGuards(
    new RateLimitGuard({
      windowMs: 1 * 60 * 1000,
      max: 5,
      message: 'Too many requests from this IP, please try again in 1 minute.',
    }),
  )
  @HttpCode(200)
  public async resend(@Body() payload: any) {
    const { email } = await this.userValidation.validateResendEmail(payload);

    const user = await this.userService.findByEmail(email);
    if (!user) throw new NotFoundException('user not found');
    if (user.isVerified) throw new ConflictException('user already verified');

    this.mailService.sendConfirmMail(
      email,
      jwt.createToken({ id: user.id, isVerified: false, isAdmin: false }),
    );

    return this.sendResponseBody({
      message: 'email sent successfully',
      code: 200,
    });
  }

  @Get('me')
  @HttpCode(200)
  public me(@UserMe() user: UserAttributes) {
    if (!user) throw new NotFoundException('user not found');
    return this.sendResponseBody({
      message: 'user found',
      code: 200,
      data: user,
    });
  }

  @Patch('image')
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 2 * 1024 * 1024, // 2mb
      },
    }),
  )
  public async changeImage(
    @UploadedFile() rawFile: Express.Multer.File | null,
    @UserMe() me: UserAttributes,
    @Query() query: any,
  ) {
    if (!rawFile) throw new BadRequestException('file is required');

    const [
      { field },
      {
        file: { originalname, buffer },
      },
    ] = await Promise.all([
      this.userValidation.validateChangeImageQuery(query),
      this.userValidation.validateProfileImage({ file: rawFile }),
    ]);

    const cond = field === 'profile';
    let newFileId: string | null,
      oldFileId: string | null = null;
    let isError = false;
    try {
      const uploaded = await this.imagekitService.uploadFile({
        file: buffer,
        fileName: originalname,
        useUniqueFileName: true,
        folder: cond ? USER_PROFILE_FOLDER : USER_BACKGROUND_FOLDER,
      });
      if (!uploaded) throw new BadGatewayException('failed to upload file');
      newFileId = uploaded.fileId;

      oldFileId = me[cond ? 'imageId' : 'backgroundImageId'];
      await this.userService[cond ? 'changeProfile' : 'changeBackground'](
        me.id,
        uploaded.url,
        uploaded.fileId,
      );

      return this.sendResponseBody({
        message: 'OK',
        code: 200,
        data: uploaded.url,
      });
    } catch (err) {
      isError = true;
      if (newFileId) this.imagekitService.bulkDelete([newFileId]);
      throw err;
    } finally {
      if (!isError && newFileId && oldFileId)
        this.imagekitService.bulkDelete([oldFileId]);
    }
  }

  @Patch('bio')
  @HttpCode(200)
  public async changeBio(@UserMe() me: UserAttributes, @Body() payload: any) {
    const { bio } = await this.userValidation.validateBio(payload);

    await this.userService.editBio(me.id, bio);
    return this.sendResponseBody({
      message: 'bio updated successfully',
      code: 200,
    });
  }

  @Get(':id')
  @HttpCode(200)
  @UseGuards(
    new RateLimitGuard({
      windowMs: 1 * 60 * 1000,
      max: 100,
      message: 'Too many requests from this IP, please try again in 1 minute.',
    }),
  )
  public getById(
    @Param('id', UserFindByIdPipe) user: User | null,
    @UserMe('id') userId: string,
  ) {
    if (!user) throw new NotFoundException('user not found');

    (async () => {
      if (user.id !== userId) {
        const exists =
          await this.profileViewerService.findOneByIdIntervalThreeDays(
            user.id,
            userId,
          );
        if (!exists)
          await this.profileViewerService.create(
            new CreateProfileViewerDto({ targetId: user.id, viewerId: userId }),
          );
      }
    })();

    return this.sendResponseBody({
      message: 'user found',
      code: 200,
      data: plainToInstance(UserDecryptedDto, user.dataValues),
    });
  }

  @Post('forget-password')
  @HttpCode(200)
  public async forgetPassword(
    @Body() payload: any,
    @Query() query: any,
    @Headers('authorization') authorization: string | undefined,
  ) {
    const { lang } = await this.userValidation.validateLangQuery(query);
    let email: string | null = null;
    let user: UserAttributes | null = null;

    if (authorization) {
      if (!authorization.startsWith('Bearer '))
        throw new UnauthorizedException('missing or invalid authorization');

      const [, token] = authorization.split(' ');
      const { id } = jwt.verifyToken(token);

      const data = await this.userService.findOneById(id);
      if (!data)
        throw new UnauthorizedException('missing or invalid authorization');

      email = user.email;
      user = user;
    } else {
      email = (await this.userValidation.validateResendEmail(payload)).email;

      const data = await this.userService.findByEmail(email);
      if (!data) throw new NotFoundException('user not found');

      user = data;
    }

    this.mailService.sendForgotPasswordMail(
      email,
      lang,
      jwt.createToken(
        { id: user.id, isVerified: user.isVerified, isAdmin: false },
        {
          expiresIn: '30m',
        },
      ),
    );

    return this.sendResponseBody({
      message: 'mail sent',
      code: 200,
    });
  }

  @Patch('change-password')
  @HttpCode(200)
  public async changePassword(@UserMe('id') id: string, @Body() payload: any) {
    const { password } =
      await this.userValidation.validateChangePassword(payload);

    await this.userService.changePassword(password, id);

    return this.sendResponseBody({
      message: 'password changed successfully',
      code: 200,
    });
  }
}
