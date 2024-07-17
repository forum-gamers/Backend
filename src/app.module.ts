import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
  RequestMethod,
} from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { transports, format } from 'winston';
import { config } from 'dotenv';
import { LoggerMiddleware } from './middlewares/global/logger.middleware';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MailerModule } from '@nestjs-modules/mailer';
import { SequelizeModule } from '@nestjs/sequelize';
import { ThirdPartyModule } from './third-party/third-party.module';
import { User } from './models/user';
import { Admin } from './models/admin';
import { UserModule } from './modules/user/user.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { Wallet } from './models/wallet';
import { XssMiddleware } from './middlewares/global/xss.middleware';
import { Post } from './models/post';
import { PostLike } from './models/postlike';
import { PostBookmark } from './models/postbookmark';
import { PostComment } from './models/postcomment';
import { PostMedia } from './models/postMedia';
import { ReplyComment } from './models/replycomment';
import { Community } from './models/community';
import { PostModule } from './modules/post/post.module';
import { PostMediaModule } from './modules/postMedia/postMedia.module';
import { LikeModule } from './modules/like/like.module';
import { UserAuthentication } from './middlewares/user/authentication.middleware';
import { VerifiedMiddleware } from './middlewares/user/verified.middleware';
import { BookmarkModule } from './modules/bookmark/bookmark.module';
import { CommentModule } from './modules/comment/comment.module';
import { ReplyModule } from './modules/reply/reply.module';
import { Follow } from './models/follow';
import { FollowModule } from './modules/follow/follow.module';
const conf = require('../config/config.json');
const environment = process.env.NODE_ENV ?? 'development';

config();

@Module({
  imports: [
    MulterModule.register({ storage: memoryStorage() }),
    WinstonModule.forRoot({
      transports: [
        new transports.Console({
          format: format.combine(
            format.timestamp(),
            format.printf(
              ({ level, message, timestamp }) =>
                `${timestamp} ${level}: ${message}`,
            ),
            format.colorize({ all: true }),
          ),
        }),
      ],
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        tls: {
          rejectUnauthorized: false,
        },
        debug: true,
        auth: {
          user: process.env.MAILER_EMAIL,
          pass: process.env.MAILER_PASSWORD,
        },
      },
    }),
    SequelizeModule.forRoot({
      username: conf[environment].username,
      password: conf[environment].password,
      database: conf[environment].database,
      dialect: conf[environment].dialect,
      uri:
        environment === 'production'
          ? conf.production.use_env_variable
          : undefined,
      logging: environment !== 'production',
      pool: {
        idle: 5,
        max: 20,
      },
      models: [
        User,
        Admin,
        Wallet,
        Post,
        PostLike,
        PostBookmark,
        PostComment,
        PostMedia,
        ReplyComment,
        Community,
        Follow,
      ],
      synchronize: environment !== 'production',
    }),
    ThirdPartyModule,
    UserModule,
    WalletModule,
    PostModule,
    PostMediaModule,
    LikeModule,
    BookmarkModule,
    CommentModule,
    ReplyModule,
    FollowModule,
  ],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*')
      .apply(XssMiddleware)
      .forRoutes('*')
      .apply(UserAuthentication)
      .exclude(
        { path: 'user/register', method: RequestMethod.POST },
        { path: 'user/login', method: RequestMethod.POST },
        { path: 'user/resend-email', method: RequestMethod.POST },
        { path: 'user/verify', method: RequestMethod.PATCH },
      )
      .forRoutes('*')
      .apply(VerifiedMiddleware)
      .exclude(
        { path: 'user/register', method: RequestMethod.POST },
        { path: 'user/login', method: RequestMethod.POST },
        { path: 'user/resend-email', method: RequestMethod.POST },
        { path: 'user/verify', method: RequestMethod.PATCH },
      )
      .forRoutes('*');
  }
}
