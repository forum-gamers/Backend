import type { ISendMailOptions } from '@nestjs-modules/mailer';

export interface SendEmailProps extends ISendMailOptions {
  to: string;
  html?: string;
  text?: string;
  subject: string;
}
