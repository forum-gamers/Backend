import { Module } from '@nestjs/common';
import { MailService } from './mail/mail.service';
import { ImageKitService } from './imagekit/imagekit.service';
import { MidtransService } from './midtrans/midtrans.service';
import { GoogleOauthService } from './google/oauth.service';

@Module({
  providers: [
    MailService,
    ImageKitService,
    MidtransService,
    GoogleOauthService,
  ],
  exports: [MailService, ImageKitService, MidtransService, GoogleOauthService],
})
export class ThirdPartyModule {}
