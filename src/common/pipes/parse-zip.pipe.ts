import {
  Injectable,
  NotFoundException,
  PipeTransform,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FileSize, Mimetype } from '../constants/file.constant';
import {
  NEED_FILE,
  NEED_FILE_10MB_SIZE,
  NEED_ZIP_FILE_EXTENSION,
} from '../constants/constant';

@Injectable()
export class ParsePdfPipe implements PipeTransform {
  constructor(private size: number = FileSize._10MB) {
    this.size = size;
  }

  transform(file: Express.Multer.File) {
    if (!file) {
      throw new NotFoundException(NEED_FILE);
    }
    if ((Mimetype.ZIP as string) !== file.mimetype) {
      throw new UnprocessableEntityException(NEED_ZIP_FILE_EXTENSION);
    }
    if (file.size > this.size) {
      throw new UnprocessableEntityException(NEED_FILE_10MB_SIZE);
    }
    return file;
  }
}
