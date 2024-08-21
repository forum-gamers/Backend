import type { CreateUserProps } from '../user.interface';
import encryption from '../../../utils/global/encryption.utils';
import { InternalServerErrorException } from '@nestjs/common';

export class CreateUser implements CreateUserProps {
  public readonly email: string;
  public readonly password: string;
  public readonly username: string;

  constructor({ email, password, username }: CreateUserProps) {
    if (!email || !password || !username)
      throw new InternalServerErrorException('parameter no supplied');

    this.email = email;
    this.username = username;
    this.password = encryption.hashData(password);
  }
}
