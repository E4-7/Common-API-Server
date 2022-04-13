import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Files } from './entities/file.entity';
import {
  MockRepository,
  mockRepository,
} from '../../common/constants/repository-mock.constant';
import { mockS3 } from '../../common/constants/s3-mock.constant';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { mockFileUpload, oneFile } from './files.mock';

describe('FilesService', () => {
  let fileService: FilesService;
  let fileRepository: MockRepository<Files>;
  let s3Service;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: getRepositoryToken(Files),
          useValue: mockRepository(),
        },
        ConfigService,
        {
          provide: S3,
          inject: [ConfigService],
          useFactory: () => mockS3(),
        },
      ],
    }).compile();
    fileRepository = module.get<MockRepository<Files>>(
      getRepositoryToken(Files),
    );
    fileService = module.get<FilesService>(FilesService);
    s3Service = module.get<S3>(S3);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('FileService is defined', () => {
    expect(fileService).toBeDefined();
  });

  describe('uploadFile', () => {
    it('파일 업로드(정상 작동)', async () => {
      fileRepository.save.mockResolvedValue({
        mockFileUpload,
      });
      s3Service.promise = jest.fn().mockResolvedValue({
        Key: mockFileUpload.key,
        Location: mockFileUpload.url,
      });

      const response = await fileService.uploadFile(oneFile);

      expect(s3Service.upload).toHaveProperty(
        'Bucket',
        configService.get('file.aws_s3_bucket_name'),
      );
      expect(s3Service.upload).toHaveProperty('Key');
      expect(s3Service.upload).toHaveProperty('Body', oneFile.buffer);
      expect(s3Service.upload).toHaveProperty('ContentType', oneFile.mimetype);
      expect(s3Service.promise).toHaveBeenCalledTimes(1);
      expect(fileRepository.save).toHaveBeenCalledTimes(1);
      expect(response).toEqual(oneFile);
    });
  });

  describe('deleteFile', () => {
    it('파일 삭제(정상 작동)', async () => {
      fileRepository.findOne.mockResolvedValue({
        mockFileUpload,
      });
      s3Service.promise = jest.fn().mockResolvedValue({});

      await fileService.deleteFile(mockFileUpload.key);

      expect(fileRepository.findOne).toHaveBeenCalledTimes(1);
      expect(s3Service.deleteObject).toHaveBeenCalledTimes(1);
      expect(fileRepository.delete).toHaveBeenCalledTimes(1);
      expect(fileRepository.delete).toHaveBeenCalledWith({
        key: mockFileUpload.key,
      });
    });
  });
});
