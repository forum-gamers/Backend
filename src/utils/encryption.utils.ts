import { AES, enc, SHA256 } from 'crypto-ts';
import { hashSync, compare } from 'bcryptjs';

class Encryption {
  private readonly key: string = process.env.ENCRYPTION_KEY;

  public encrypt = (data: string): string =>
    AES.encrypt(data.replace(/\s/g, '_'), enc.Utf8.parse(this.key)).toString();

  public decrypt = (data: string): string =>
    AES.decrypt(data, enc.Utf8.parse(this.key))
      .toString(enc.Utf8)
      .replace(/_/g, ' ');

  public hashData = (data: string) => hashSync(data, 10);

  public compareEncryption = async (data: string, hashData: string) =>
    await compare(data, hashData);
}

const encryption = new Encryption();

export default encryption;
