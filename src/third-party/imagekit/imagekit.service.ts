import { BadRequestException, Injectable } from '@nestjs/common';
import ImageKit from 'imagekit';
import type { UploadFileProps, UploadResp } from './imagekit.interface';

@Injectable()
export class ImageKitService {
  private readonly client = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL,
  });

  public async uploadFile({
    file,
    fileName,
    folder,
    useUniqueFileName,
  }: UploadFileProps): Promise<UploadResp> {
    return await this.client.upload({
      file,
      fileName,
      folder,
      useUniqueFileName,
    });
  }

  public async multipleUpload(files: UploadFileProps[]) {
    if (files?.length > 4)
      throw new BadRequestException('max files upload is 4');

    return await Promise.all(
      files.map(({ file, fileName, folder, useUniqueFileName }) =>
        this.uploadFile({ file, fileName, folder, useUniqueFileName }),
      ),
    );
  }

  public async bulkDelete(fileIds: string[]): Promise<void> {
    return (await this.client.bulkDeleteFiles(fileIds)) as void;
  }
}
