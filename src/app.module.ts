import 'dotenv/config';
import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { transports, format } from 'winston';
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
import { SearchModule } from './modules/search/search.module';
import { CronModule } from './cron/cron.module';
import { AdminModule } from './modules/admin/admin.module';
import { AdminLog } from './models/adminlog';
import { AdminLogModule } from './modules/adminLog/adminLog.module';
import { SearchHistory } from './models/searchHistory';
import { HistoryModule } from './modules/history/history.module';
import { Game } from './models/game';
import { GameModule } from './modules/game/game.module';
import { Team } from './models/team';
import { TeamMember } from './models/teammember';
import { TeamModule } from './modules/team/team.module';
import { TeamMemberModule } from './modules/teamMember/teamMember.module';
import { Transaction } from './models/transaction';
import { TransactionModule } from './modules/transaction/transaction.module';
import { DiscordProfile } from './models/discordprofile';
import { DiscordModule } from './modules/discord/discord.module';
const conf = require('../config/config.js');
const environment = process.env.NODE_ENV ?? 'development';

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
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      username: conf[environment].username,
      password: conf[environment].password,
      database: conf[environment].database,
      dialect: conf[environment].dialect,
      uri: conf[environment].uri,
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
        AdminLog,
        SearchHistory,
        Game,
        Team,
        TeamMember,
        Transaction,
        DiscordProfile,
      ],
      synchronize: environment !== 'production',
      timezone: '+07:00',
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
    SearchModule,
    CronModule,
    AdminModule,
    AdminLogModule,
    HistoryModule,
    GameModule,
    TeamModule,
    TeamMemberModule,
    TransactionModule,
    DiscordModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    /**
     * TODO
     * fix
     * @description i dont know what shit happen but excluded routes still affected by middleware
     */
    consumer.apply(LoggerMiddleware, XssMiddleware).forRoutes('*');
  }
}
