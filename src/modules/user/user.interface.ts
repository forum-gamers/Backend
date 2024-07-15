export interface RegisterInputProps {
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface CreateUserProps {
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface LoginInputProps {
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
  phoneNumber: string;
  username: string;
}

export interface ILoginProps {
  email: string;
  password: string;
}
