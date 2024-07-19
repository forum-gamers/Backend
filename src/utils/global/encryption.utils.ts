import { hashSync, compare } from 'bcryptjs';
import { enc, AES } from 'crypto-ts';
import { config } from 'dotenv';
import { createHmac } from 'crypto';

config();

export interface EncryptedReturn {
  hmac: string;
  chipertext: string;
}

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

  public createChatEncryption = (data: string): string =>
    AES.encrypt(data, enc.Utf8.parse(this.chatKey)).toString();

  // public createHmacFromChipertext = (chipertext: string) =>
  //   HmacSHA256(chipertext, this.hmacKey).toString();

  public decryptChatEncyption = <T>(chipertext: string) =>
    JSON.parse(AES.decrypt(chipertext, this.chatKey).toString(enc.Utf8)) as T;

  // public isValidEncryption = ({ chipertext, hmac }: EncryptedReturn) =>
  //   HmacSHA256(chipertext, this.hmacKey).toString() === hmac;
}

const encryption = new Encryption();

export default encryption;
