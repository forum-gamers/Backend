import { extname } from 'path';
import {
  SUPPORTED_IMAGE_EXT,
  SUPPORTED_VIDEO_EXT,
} from 'src/constants/global.constant';
import type { FileType } from 'src/interfaces/model.interface';

class GlobalUtils {
  public isValidUUID(id: string) {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
      id,
    );
  }

  public getFileExtFromUrl(url: string): FileType | 'unsupported file type' {
    const { pathname } = new URL(url);
    switch (true) {
      case SUPPORTED_IMAGE_EXT.includes(extname(pathname).toLowerCase()):
        return 'image';
      case SUPPORTED_VIDEO_EXT.includes(extname(pathname).toLowerCase()):
        return 'video';
      default:
        return 'unsupported file type';
    }
  }
}

const globalUtils = new GlobalUtils();

export default globalUtils;
