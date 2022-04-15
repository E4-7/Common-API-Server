import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { Files } from './entities/files.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
  NOT_FOUND_FILE_KEY,
  UNKNOWN_ERR,
} from '../../common/constants/error.constant';

@Injectable()
export class FilesService {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    @InjectRepository(Files) private readonly fileRepository: Repository<Files>,
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
      const uploadToDBResult = await this.fileRepository.save({
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
    const file = await this.fileRepository.findOne({ key });
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
      await this.fileRepository.delete({ key });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(UNKNOWN_ERR);
    }
  }
}
