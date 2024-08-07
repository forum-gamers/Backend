import type { AdminDivision, AdminRole } from 'src/interfaces/model.interface';
import encryption from 'src/utils/global/encryption.utils';
import { v4 } from 'uuid';

export class CreateAdminDto {
  public readonly fullname: string;
  public readonly email: string;
  public readonly password: string;
  public readonly division: AdminDivision;
  public readonly role: AdminRole;
  public readonly id: string;

  constructor({
    fullname,
    email,
    password,
    division,
    role,
  }: CreateAdminDtoProps) {
    this.fullname = fullname;
    this.email = email;
    this.password = encryption.hashData(password);
    this.division = division;
    this.role = role;
    this.id = v4();
  }
}

export interface CreateAdminDtoProps {
  fullname: string;
  email: string;
  password: string;
  division: AdminDivision;
  role: AdminRole;
}
