import { Module } from '@nestjs/common';
import { MailService } from './mail/mail.service';
import { ImageKitService } from './imagekit/imagekit.service';
import { MidtransService } from './midtrans/midtrans.service';

@Module({
  providers: [MailService, ImageKitService, MidtransService],
  exports: [MailService, ImageKitService, MidtransService],
})
export class ThirdPartyModule {}
