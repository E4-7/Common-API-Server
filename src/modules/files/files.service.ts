import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import {
  NOT_FOUND_FILE_KEY,
  UNKNOWN_ERR,
} from '../../common/constants/error.constant';
import { FilesRepository } from './repositories/files.repository';

@Injectable()
export class FilesService {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    private readonly filesRepository: FilesRepository,
    private readonly s3: S3,
    private readonly configService: ConfigService,
  ) {}

  async uploadFile(fileInBody: Express.Multer.File) {
    const { size, mimetype, originalname } = fileInBody;
    try {
      const uploadToS3Result = await this.s3
        .upload({
          Bucket: this.configService.get('file.aws_s3_bucket_name'),
          Key: `files/${new Date().valueOf()}/${originalname}`,
          Body: fileInBody.buffer,
          ContentType: fileInBody.mimetype,
        })
        .promise();
      const uploadToDBResult = await this.filesRepository.save({
        key: uploadToS3Result.Key,
        size,
        mimetype,
        original_name: originalname,
        url: uploadToS3Result.Location,
      });
      return uploadToDBResult;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(UNKNOWN_ERR);
    }
  }

  async deleteFile(key: string) {
    const file = await this.filesRepository.findOne({ key });
    if (!file) {
      throw new NotFoundException(NOT_FOUND_FILE_KEY);
    }
    try {
      await this.s3
        .deleteObject({
          Bucket: this.configService.get('file.aws_s3_bucket_name'),
          Key: key,
        })
        .promise();
      await this.filesRepository.delete({ key });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(UNKNOWN_ERR);
    }
  }
}
