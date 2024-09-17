import { Module } from '@nestjs/common';
import { MailService } from './mail/mail.service';
import { ImageKitService } from './imagekit/imagekit.service';
import { MidtransService } from './midtrans/midtrans.service';
import { GoogleOauthService } from './google/oauth.service';
import { DiscordOauthService } from './discord/oauth.service';
import { DiscordMeService } from './discord/me.service';

@Module({
  providers: [
    MailService,
    ImageKitService,
    MidtransService,
    GoogleOauthService,
    DiscordOauthService,
    DiscordMeService,
  ],
  exports: [
    MailService,
    ImageKitService,
    MidtransService,
    GoogleOauthService,
    DiscordOauthService,
    DiscordMeService,
  ],
})
export class ThirdPartyModule {}
