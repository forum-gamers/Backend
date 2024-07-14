import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import type { SendEmailProps } from './mail.interface';

@Injectable()
export class MailService {
  constructor(private readonly mailer: MailerService) {}

  private async sendEmail({
    to,
    html,
    text,
    subject,
    ...rest
  }: SendEmailProps) {
    return await this.mailer.sendMail({ ...rest, text, to, html, subject });
  }
}
