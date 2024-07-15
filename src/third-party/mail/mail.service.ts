import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import type { SendEmailProps } from './mail.interface';
import { CONFIRM_MAIL } from './mail.constant';
import { config } from 'dotenv';

config();

@Injectable()
export class MailService {
  constructor(private readonly mailer: MailerService) {}

  private sendEmail = async ({
    to,
    html,
    text,
    subject,
    ...rest
  }: SendEmailProps) =>
    await this.mailer.sendMail({
      ...rest,
      text,
      to,
      html,
      subject,
      from: `${process.env.MAILER_EMAIL} <no reply>`,
    });

  public sendConfirmMail = async (to: string, token: string) =>
    await this.sendEmail({
      to,
      subject: 'Confirm Email',
      html: CONFIRM_MAIL.replaceAll(
        '[TARGET_URL]',
        `${process.env.PUBLIC_APP_URL ?? 'http://localhost:3000'}/user/verify?token=${token}`,
      ),
    });
}
