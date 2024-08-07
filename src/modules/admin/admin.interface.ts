import type { AdminDivision, AdminRole } from 'src/interfaces/model.interface';

export interface LoginProps {
  email: string;
  password: string;
}

export interface IRegisterAdminProps extends LoginProps {
  fullname: string;
  division: AdminDivision;
  role: AdminRole;
}
