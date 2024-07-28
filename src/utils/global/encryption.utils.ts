import { hashSync, compare } from 'bcryptjs';
import { enc, AES } from 'crypto-ts';
import { config } from 'dotenv';
import { createHmac } from 'crypto';

config();

class Encryption {
  public hashData = (data: string) => hashSync(data, 10);

  public compareEncryption = async (data: string, hashData: string) =>
    await compare(data, hashData);

  public createChatEncryption = (data: string): string => {
    const encrypted = AES.encrypt(
      data,
      enc.Utf8.parse(process.env.CHAT_ENCRYPTION_KEY),
    ).toString();
    return `${encrypted}:${this.createHmac(encrypted)}`;
  };

  public decryptChatEncyption = (chipertext: string) =>
    AES.decrypt(chipertext, process.env.CHAT_ENCRYPTION_KEY).toString(enc.Utf8);

  public isValidEncryption = (chipertext: string, hmac: string) =>
    this.createHmac(chipertext) === hmac;

  private createHmac = (data: string) =>
    createHmac('sha256', process.env.CHAT_HMAC_KEY).update(data).digest('hex');
}

const encryption = new Encryption();

export default encryption;
