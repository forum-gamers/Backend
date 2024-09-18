import { Controller, Get, HttpCode, NotFoundException } from '@nestjs/common';
import { BaseController } from 'src/base/controller.base';
import { DiscordMeService } from 'src/third-party/discord/me.service';
import { UserMe } from '../user/decorators/me.decorator';
import { UserService } from '../user/user.service';
import { DiscordProfile } from 'src/models/discordprofile';

@Controller('discord')
export class DiscordController extends BaseController {
  constructor(
    private readonly discordMeService: DiscordMeService,
    private readonly userService: UserService,
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

    const { data = [] } = await this.discordMeService.getMyGuild(
      discordProfile.discordProfile?.dataValues?.accessToken,
    );

    return this.sendResponseBody({
      message: 'success',
      code: 200,
      data,
    });
  }
}
