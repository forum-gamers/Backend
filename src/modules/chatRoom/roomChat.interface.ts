export interface CreateRoomInputBody {
  users: string[];
  description?: string;
  name?: string;
}

export interface IFileProps {
  file: Express.Multer.File;
}
