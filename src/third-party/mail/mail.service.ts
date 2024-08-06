import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import type { SendEmailProps } from './mail.interface';
import { CONFIRM_MAIL, FORGET_PASSWORD_EMAIL } from './mail.constant';
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

  public sendBackup = async (attachment: string) =>
    await this.sendEmail({
      to: process.env.BACKUP_EMAIL,
      subject: `Backup ${new Date().toISOString()}`,
      text: `backup database ${new Date().toISOString()}`,
      attachments: [
        {
          filename: 'backup.sql',
          content: attachment,
        },
      ],
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

  public sendForgotPasswordMail = async (
    to: string,
    lang: 'en' | 'id',
    token: string,
  ) => {
    const cond = lang === 'en';
    return await this.sendEmail({
      to,
      subject: 'Forgot Password',
      html: FORGET_PASSWORD_EMAIL.replaceAll(
        '[TARGET_URL]',
        `${process.env.PUBLIC_APP_URL ?? 'http://localhost:3000'}/reset-password?token=${token}`,
      )
        .replaceAll('[TITLE]', cond ? 'Password reset' : 'Reset Password')
        .replaceAll(
          '[STEPS]',
          cond
            ? "After you click the button, you'll be asked to complete the following steps:"
            : 'Setelah klik tombol, Anda akan diminta untuk melengkapi langkah berikut:',
        )
        .replaceAll(
          '[STEP_1]',
          cond ? 'Enter your new password.' : 'Masukkan password baru.',
        )
        .replaceAll(
          '[STEP_2]',
          cond
            ? 'Enter your new password again.'
            : 'Masukkan ulang password baru.',
        )
        .replaceAll('[STEP_3]', cond ? 'Click Submit' : 'Klik Submit')
        .replaceAll(
          '[REMINDER]',
          cond
            ? 'This link is valid for one use only. Expires in 30 minutes.'
            : 'link ini hanya dapat digunakan sekali. Kadaluwarsa dalam 30 menit.',
        )
        .replaceAll(
          '[MESSAGE]',
          cond
            ? "If you didn't request to reset your password, please disregard this message or contact our customer service department."
            : 'Jika Anda tidak meminta untuk mereset kata sandi Anda, harap abaikan pesan ini atau hubungi bagian layanan pelanggan kami.',
        )
        .replaceAll(
          '[BTN_TEXT]',
          cond ? 'RESET YOUR PASSWORD' : 'Reset Password Mu',
        ),
    });
  };
}
