import {
  Injectable,
  NotFoundException,
  PipeTransform,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FileSize, Mimetype } from '../constants/file-info.constant';
import {
  NEED_FILE,
  NEED_FILE_10MB_SIZE,
  NEED_IMAGE_FILE_EXTENSION,
} from '../constants/error';

@Injectable()
export class ParseImagePipe implements PipeTransform {
  constructor(private size: FileSize) {
    this.size = size;
  }

  transform(file: Express.Multer.File) {
    const imageMimetypes = [
      Mimetype.PNG,
      Mimetype.JPG,
      Mimetype.JPEG,
    ] as Array<string>;
    if (!file) {
      throw new NotFoundException(NEED_FILE);
    }
    const isImage = imageMimetypes.includes(file.mimetype);
    if (!isImage) {
      throw new UnprocessableEntityException(NEED_IMAGE_FILE_EXTENSION);
    }
    if (file.size > this.size) {
      throw new UnprocessableEntityException(NEED_FILE_10MB_SIZE);
    }
    return file;
  }
}
