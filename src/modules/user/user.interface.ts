import type { UserProfileDto } from './dto/userProfile.dto';

export interface RegisterInputProps {
  username: string;
  email: string;
  password: string;
}

export interface CreateUserProps {
  username: string;
  email: string;
  password: string;
}

export interface Message {
  message: string;
}

export interface ChangeProfileInput {
  url: string;
  fileId: string;
}

export interface ICheckExisting {
  email: string;
}

export interface ILoginProps {
  identifier: string;
  password: string;
}

export interface IResendEmailProps {
  email: string;
}

export interface IChangeImageQuery {
  field: 'profile' | 'background';
}

export interface IChangeImage {
  file: Express.Multer.File;
}

export interface EditBioProps {
  bio: string;
}

export interface LangQueryAccept {
  lang: 'en' | 'id';
}

export interface ChangePasswordProps {
  password: string;
  confirmPassword: string;
}

export interface UserProfileDbResult {
  totalData: number;
  datas: UserProfileDto;
}
