import type { CreateUserProps } from '../user.interface';
import encryption from '../../../utils/global/encryption.utils';
import { InternalServerErrorException } from '@nestjs/common';

export class CreateUser implements CreateUserProps {
  public readonly email: string;
  public readonly password: string;
  public readonly phoneNumber: string;
  public readonly username: string;

  constructor({ email, password, phoneNumber, username }: CreateUserProps) {
    if (!email || !password || !phoneNumber || !username)
      throw new InternalServerErrorException('parameter no supplied');

    this.email = encryption.encrypt(email);
    this.phoneNumber = encryption.encrypt(phoneNumber);
    this.username = username;
    this.password = encryption.hashData(password);
  }
}
