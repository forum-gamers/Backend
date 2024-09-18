export interface ICreateCommunityProps {
  name?: string;
  description?: string;
  discordServerId?: string;
}

export interface IFileProps {
  file: Express.Multer.File;
}
