import { extname } from 'path';
import {
  SUPPORTED_AUDIO_EXT,
  SUPPORTED_DOCUMENT_EXT,
  SUPPORTED_IMAGE_EXT,
  SUPPORTED_VIDEO_EXT,
} from 'src/constants/global.constant';
import type { ChatFileType } from 'src/interfaces/model.interface';

class GlobalUtils {
  public isValidUUID(id: string) {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
      id,
    );
  }

  public getFileExtFromUrl(
    url: string,
  ): ChatFileType | 'unsupported file type' {
    const { pathname } = new URL(url);
    switch (true) {
      case SUPPORTED_IMAGE_EXT.includes(extname(pathname).toLowerCase()):
        return 'image';
      case SUPPORTED_VIDEO_EXT.includes(extname(pathname).toLowerCase()):
        return 'video';
      case SUPPORTED_AUDIO_EXT.includes(extname(pathname).toLowerCase()):
        return 'audio';
      case SUPPORTED_DOCUMENT_EXT.includes(extname(pathname).toLowerCase()):
        return 'document';
      default:
        return 'unsupported file type';
    }
  }

  public generateRandomNumber(length: number): string {
    const characters = '0123456789';
    let result = '';

    for (let i = 0; i < length; i++)
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );

    return result;
  }
}

const globalUtils = new GlobalUtils();

export default globalUtils;
