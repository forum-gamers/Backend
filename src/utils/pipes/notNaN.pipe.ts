import {
  type ArgumentMetadata,
  BadRequestException,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';

@Injectable()
export class NotNaN implements PipeTransform {
  public transform(value: number, metadata: ArgumentMetadata) {
    if (isNaN(value))
      throw new BadRequestException({
        [metadata.data]: `${metadata.data} not a number`,
      });
    return value;
  }
}
