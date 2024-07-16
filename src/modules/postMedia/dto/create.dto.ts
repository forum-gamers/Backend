import { BadRequestException } from '@nestjs/common';
import type { FileType } from 'src/interfaces/model.interface';
import type { UploadResp } from 'src/third-party/imagekit/imagekit.interface';
import globalUtils from 'src/utils/global/global.utils';

export class CreatePostMediaDto {
  public readonly type: FileType;
  public readonly url: string;
  public readonly fileId: string;
  public readonly postId: number;

  constructor(file: UploadResp, postId: number) {
    let type = globalUtils.getFileExtFromUrl(file.url);
    if (type === 'unsupported file type')
      throw new BadRequestException('unsupported file type');

    this.url = file.url;
    this.fileId = file.fileId;
    this.postId = postId;
    this.type = type as FileType;
  }
}
