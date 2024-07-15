import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
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
      models: [User, Admin, Wallet],
      synchronize: environment !== 'production',
    }),
    ThirdPartyModule,
    UserModule,
    WalletModule,
  ],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*')
      .apply(XssMiddleware)
      .forRoutes('*');
  }
}
