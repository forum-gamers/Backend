import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DiscordProfile } from 'src/models/discordprofile';
import { ThirdPartyModule } from 'src/third-party/third-party.module';
import { DiscordService } from './discord.service';
import { DiscordController } from './discord.controller';
import { USER_VERIFIED_MIDDLEWARE } from 'src/constants/global.constant';

@Module({
  imports: [SequelizeModule.forFeature([DiscordProfile]), ThirdPartyModule],
  providers: [DiscordService],
  exports: [DiscordService],
  controllers: [DiscordController],
})
export class DiscordModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(...USER_VERIFIED_MIDDLEWARE).forRoutes(DiscordController);
  }
}
