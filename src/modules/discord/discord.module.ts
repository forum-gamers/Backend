import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DiscordProfile } from 'src/models/discordprofile';
import { ThirdPartyModule } from 'src/third-party/third-party.module';
import { DiscordService } from './discord.service';

@Module({
  imports: [SequelizeModule.forFeature([DiscordProfile]), ThirdPartyModule],
  providers: [DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}
