export interface ICreateCommunityProps {
  name: string;
  description?: string;
}

export interface IFileProps {
  file: Express.Multer.File;
}
