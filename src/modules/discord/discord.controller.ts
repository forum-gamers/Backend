import {
  BadGatewayException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { BaseController } from 'src/base/controller.base';
import { DiscordMeService } from 'src/third-party/discord/me.service';
import { UserMe } from '../user/decorators/me.decorator';
import { UserService } from '../user/user.service';
import { DiscordProfile } from 'src/models/discordprofile';
import globalUtils from 'src/utils/global/global.utils';
import { DiscordOauthService } from 'src/third-party/discord/oauth.service';
import { DiscordService } from './discord.service';

@Controller('discord')
export class DiscordController extends BaseController {
  constructor(
    private readonly discordMeService: DiscordMeService,
    private readonly userService: UserService,
    private readonly discordOauthService: DiscordOauthService,
    private readonly discordService: DiscordService,
  ) {
    super();
  }

  @Get('guilds')
  @HttpCode(200)
  public async getMyGuild(@UserMe('id') userId: string) {
    const discordProfile = await this.userService.findOneById(userId, {
      include: [{ model: DiscordProfile }],
    });
    if (!discordProfile?.discordProfile?.dataValues)
      throw new NotFoundException('you have not linked discord profile yet');

    let accessToken = discordProfile.discordProfile?.dataValues?.accessToken;
    if (
      globalUtils.isExpires(
        Number(discordProfile.discordProfile?.dataValues?.tokenExpires),
        Math.floor(
          discordProfile.discordProfile?.dataValues?.updatedAt.getTime() / 1000,
        ),
      )
    ) {
      const { data, status } = await this.discordOauthService.refreshToken(
        discordProfile.discordProfile?.dataValues?.refreshToken,
      );

      if (status !== 200 || !data)
        throw new BadGatewayException('failed to get new token');

      accessToken = data.access_token;
      this.discordService.updateData(discordProfile?.discordProfile?.id, {
        accessToken,
        refreshToken: data.refresh_token,
        tokenExpires: BigInt(data.expires_in),
        imageUrl: discordProfile.discordProfile?.dataValues?.imageUrl,
        backgroundUrl: discordProfile.discordProfile?.dataValues?.backgroundUrl,
      });
    }
    const { data = [] } = await this.discordMeService.getMyGuild(accessToken);

    return this.sendResponseBody({
      message: 'success',
      code: 200,
      data: data instanceof Array ? data : [], // <- bisa aja object error
    });
  }
}
