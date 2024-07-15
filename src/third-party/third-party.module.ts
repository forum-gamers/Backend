import { Module } from '@nestjs/common';
import { MailService } from './mail/mail.service';
import { ImageKitService } from './imagekit/imagekit.service';

@Module({
  providers: [MailService, ImageKitService],
  exports: [MailService, ImageKitService],
})
export class ThirdPartyModule {}
