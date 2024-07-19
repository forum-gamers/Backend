import { hashSync, compare } from 'bcryptjs';
import { enc, AES } from 'crypto-ts';
import { config } from 'dotenv';
import { createHmac } from 'crypto';

config();

class Encryption {
  private readonly key: string = process.env.ENCRYPTION_KEY;
  private readonly chatKey: string = process.env.CHAT_ENCRYPTION_KEY;
  private readonly hmacKey: string = process.env.CHAT_HMAC_KEY;

  public encrypt = (data: string): string =>
    AES.encrypt(data.replace(/\s/g, '_'), enc.Utf8.parse(this.key)).toString();

  public decrypt = (data: string): string =>
    AES.decrypt(data, enc.Utf8.parse(this.key))
      .toString(enc.Utf8)
      .replace(/_/g, ' ');

  public hashData = (data: string) => hashSync(data, 10);

  public compareEncryption = async (data: string, hashData: string) =>
    await compare(data, hashData);

  public createChatEncryption = (data: string): string => {
    const encrypted = AES.encrypt(
      data,
      enc.Utf8.parse(this.chatKey),
    ).toString();
    return `${encrypted}:${this.createHmac(encrypted)}`;
  };

  public decryptChatEncyption = (chipertext: string) =>
    AES.decrypt(chipertext, this.chatKey).toString(enc.Utf8);

  public isValidEncryption = (chipertext: string, hmac: string) =>
    this.createHmac(chipertext) === hmac;

  private createHmac = (data: string) =>
    createHmac('sha256', this.hmacKey).update(data).digest('hex');
}

const encryption = new Encryption();

export default encryption;
