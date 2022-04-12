import { Injectable, LoggerService, NotFoundException } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { File } from './entities/file.entity';
import { Connection, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { NOT_FOUND_FILE_KEY } from '../common/constants/error';

@Injectable()
export class FilesService {
  constructor(
    private logger: LoggerService,
    private readonly s3: S3,
    @InjectRepository(File) private fileRepository: Repository<File>,
    private connection: Connection,
    private configService: ConfigService,
  ) {}

  async uploadFile(fileInBody: Express.Multer.File) {
    const { size, mimetype, originalname } = fileInBody;
    const uploadResult = await this.s3
      .upload({
        Bucket: this.configService.get('file.aws_s3_bucket_name'),
        Key: `files/${new Date().valueOf()}/${originalname}`,
        Body: fileInBody.buffer,
        ContentType: fileInBody.mimetype,
      })
      .promise();
    const file = this.fileRepository.save({
      key: uploadResult.Key,
      size,
      mimetype,
      original_name: originalname,
      url: uploadResult.Location,
    });
    return file;
  }

  async deleteFile(key: string) {
    const file = await this.fileRepository.findOne({ key });
    if (!file) {
      throw new NotFoundException(NOT_FOUND_FILE_KEY);
    }
    await this.s3
      .deleteObject({
        Bucket: this.configService.get('file.aws_s3_bucket_name'),
        Key: key,
      })
      .promise()
      .catch((err) => this.logger.error(err));
  }
}
