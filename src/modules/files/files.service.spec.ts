import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  MockRepository,
  mockRepository,
} from '../../common/constants/repository-mock.constant';
import { mockS3 } from '../../common/constants/s3-mock.constant';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { mockFileUpload, oneFile } from './files.mock';
import {
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  NOT_FOUND_FILE_KEY,
  UNKNOWN_ERR,
} from '../../common/constants/error.constant';
import { FilesRepository } from './repositories/files.repository';

describe('FilesService', () => {
  let fileService: FilesService;
  let fileRepository: MockRepository<FilesRepository>;
  let s3Service;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        Logger,
        {
          provide: getRepositoryToken(FilesRepository),
          useValue: mockRepository(),
        },
        ConfigService,
        {
          provide: S3,
          useValue: mockS3(),
        },
      ],
    }).compile();
    fileRepository = module.get<MockRepository<FilesRepository>>(
      getRepositoryToken(FilesRepository),
    );
    fileService = module.get<FilesService>(FilesService);
    s3Service = module.get<S3>(S3);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('FileService is defined', () => {
    expect(fileService).toBeDefined();
  });

  describe('uploadFile', () => {
    beforeAll(() => {
      jest.useFakeTimers('modern');
      jest.setSystemTime(new Date(2020, 3, 1));
    });
    afterAll(() => {
      jest.useRealTimers();
    });

    it('파일 업로드(정상 작동)', async () => {
      fileRepository.save.mockResolvedValue({
        mockFileUpload,
      });
      s3Service.promise = jest.fn().mockResolvedValue({
        Key: mockFileUpload.key,
        Location: mockFileUpload.url,
      });

      const response = await fileService.uploadFile(oneFile);

      expect(s3Service.promise).toHaveBeenCalledTimes(1);
      expect(s3Service.upload).toHaveBeenCalledWith({
        Bucket: configService.get('file.aws_s3_bucket_name'),
        Key: `files/${new Date().valueOf()}/${oneFile.originalname}`,
        Body: oneFile.buffer,
        ContentType: oneFile.mimetype,
      });
      expect(fileRepository.save).toHaveBeenCalledWith({
        key: mockFileUpload.key,
        size: oneFile.size,
        mimetype: oneFile.mimetype,
        original_name: oneFile.originalname,
        url: mockFileUpload.url,
      });
      expect(fileRepository.save).toHaveBeenCalledTimes(1);
      expect(response).toStrictEqual({ mockFileUpload });
    });

    it('파일 업로드(s3 업로드, 저장소 저장 실패)', () => {
      fileRepository.save.mockResolvedValue({
        mockFileUpload,
      });
      s3Service.promise = jest.fn().mockImplementation(() => {
        throw new InternalServerErrorException();
      });
      expect(fileService.uploadFile(oneFile)).rejects.toThrowError(
        new InternalServerErrorException(UNKNOWN_ERR),
      );
    });
  });

  describe('deleteFile', () => {
    it('파일 삭제(키가 없을 경우)', () => {
      fileRepository.findOne.mockResolvedValue(null);

      expect(fileService.deleteFile(mockFileUpload.key)).rejects.toThrowError(
        new NotFoundException(NOT_FOUND_FILE_KEY),
      );
    });
    it('파일 삭제(키가 없거나, fileRepository delete 안될 경우)', () => {
      fileRepository.findOne.mockResolvedValue({
        mockFileUpload,
      });
      s3Service.promise = jest.fn().mockImplementation(() => {
        throw new InternalServerErrorException();
      });
      expect(fileService.deleteFile(mockFileUpload.key)).rejects.toThrowError(
        new InternalServerErrorException(UNKNOWN_ERR),
      );
    });
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
