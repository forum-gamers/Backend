import type { ReadStream } from 'fs';

export interface UploadFileProps {
  file: string | Buffer | ReadStream;
  fileName: string;
  useUniqueFileName?: boolean;
  folder: string;
}

export interface UploadResp {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  height: number;
  width: number;
  size: number;
  fileType: string;
  filePath: string;
  tags?: string[];
  isPrivateFile: boolean;
  customCoordinates: string | null;
}
