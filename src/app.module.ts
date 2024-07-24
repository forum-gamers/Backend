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
import { CommunityModule } from './modules/community/community.module';
import { CommunityMembers } from './models/communitymember';
import { CommunityMemberModule } from './modules/communityMember/communityMember.module';
import { RoomChat } from './models/roomchat';
import { RoomMember } from './models/roommember';
import { Chat } from './models/chat';
import { RoomChatModule } from './modules/chatRoom/roomChat.module';
import { RoomMemberModule } from './modules/roomMember/roomMember.module';
import { ChatModule } from './modules/chat/chat.module';
import { WsModule } from './modules/ws/ws.module';
import { ChatRead } from './models/chatread';
import { ChatReadModule } from './modules/chatRead/chatRead.module';
import { UserPreferences } from './models/userpreference';
import { PostShare } from './models/postshare';
import { PostShareModule } from './modules/postShare/postShare.module';
import { UserPreferenceModule } from './modules/userPreference/userPreference.module';
import { ProfileViewers } from './models/profileviewer';
import { ProfileViewerModule } from './modules/profileViewer/profileViewer.module';
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
        CommunityMembers,
        RoomChat,
        RoomMember,
        Chat,
        ChatRead,
        UserPreferences,
        PostShare,
        ProfileViewers,
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
    CommunityModule,
    CommunityMemberModule,
    RoomChatModule,
    RoomMemberModule,
    ChatModule,
    WsModule,
    ChatReadModule,
    PostShareModule,
    UserPreferenceModule,
    ProfileViewerModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    /**
     * TODO
     * fix
     * @description i dont know what shit happer but excluded routes still affected by middleware
     */
    consumer.apply(LoggerMiddleware, XssMiddleware).forRoutes('*');
  }
}
