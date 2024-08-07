import { Inject, Injectable } from '@nestjs/common';
import { MailService } from 'src/third-party/mail/mail.service';
import { schedule } from 'node-cron';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { resolve } from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
import { readFile, unlink } from 'fs';
import 'dotenv/config';

@Injectable()
export class BackupService {
  private readonly backupPath = resolve(__dirname, 'backup.sql');
  constructor(
    private readonly mailerService: MailService,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {
    this.backup();
  }

  private backup() {
    schedule('0 12,0 * * *', async () => {
      try {
        this.logger.info(`backup started...`);

        await promisify(exec)(
          `PGPASSWORD=${process.env.DATABASE_PASSWORD} pg_dump -U ${process.env.DATABASE_USERNAME} -h ${process.env.DATABASE_HOST} -p ${process.env.DATABASE_PORT} postgres -F p -b -v -f ${this.backupPath}`,
        );
        readFile(this.backupPath, 'utf8', async (err, data) => {
          if (err) throw err;

          await this.mailerService.sendBackup(data);
        });

        unlink(this.backupPath, (err) => {
          if (err) throw err;
        });
        this.logger.info(`backup completed...`);
      } catch (err) {
        this.logger.error(err?.message ?? err ?? 'unknown error');
      }
    });
  }
}
