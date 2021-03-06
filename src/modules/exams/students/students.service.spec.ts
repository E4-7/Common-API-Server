import { Test, TestingModule } from '@nestjs/testing';
import { StudentsService } from './students.service';
import { FilesService } from '../../files/files.service';
import {
  mockRepository,
  MockRepository,
} from '../../../common/constants/repository-mock.constant';
import { mockFileService } from '../../files/files.mock';
import { ExamsRepository } from '../repositories/exams.repository';
import { ExamsUsersRepository } from '../repositories/exams-users.repository';
import { FilesRepository } from '../../files/repositories/files.repository';
import { StudentsRepository } from './repositories/students.repository';
import { mockHttpService } from '../../../common/constants/http-mock.constant';
import {
  ALREADY_HAS_ID,
  NEED_AUTHENTIFICATION,
} from '../../../common/constants/error.constant';
import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

describe('StudentsService', () => {
  let service: StudentsService;
  let fileService: FilesService;
  let httpService: HttpService;
  let examRepository: MockRepository;
  let examUsersRepository: MockRepository;
  let studentRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        {
          module: class FakeModule {},
          providers: [{ provide: FilesService, useValue: mockFileService }],
          exports: [FilesService],
        },
      ],
      providers: [
        StudentsService,
        { provide: HttpService, useValue: mockHttpService },
        {
          provide: StudentsRepository,
          useValue: mockRepository(),
        },
        {
          provide: ExamsRepository,
          useValue: mockRepository(),
        },
        {
          provide: ExamsUsersRepository,
          useValue: mockRepository(),
        },
        {
          provide: FilesRepository,
          useValue: mockRepository(),
        },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    fileService = module.get(FilesService);
    httpService = module.get(HttpService);
    studentRepository = module.get(StudentsRepository);
    examRepository = module.get(ExamsRepository);
    examUsersRepository = module.get(ExamsUsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('save?????? ????????? ?????? ?????? ???', async () => {
      examUsersRepository.find.mockReturnValue([{ UserId: '0' }]);
      studentRepository.save.mockReturnValue(
        new InternalServerErrorException(),
      );
      try {
        await service.create('0', '0', { students: [] });
      } catch (e) {
        expect(e.message).toBe(ALREADY_HAS_ID);
        expect(e).toBeInstanceOf(InternalServerErrorException);
      }
    });
    it('??????', async () => {
      examUsersRepository.find.mockReturnValue([{ UserId: '0' }]);
      studentRepository.save.mockReturnValue([]);
      const result = await service.create('0', '0', { students: [] });
      expect(result).toStrictEqual([]);
    });
  });

  describe('findAll', () => {
    it('??????', async () => {
      examUsersRepository.find.mockReturnValue([{ UserId: '0' }]);
      studentRepository.createQueryBuilder().getMany.mockReturnValue({});
      const result = await service.findAll('0', '0');
      expect(result).toStrictEqual({});
    });
  });

  describe('isStudentIsAuthentic', () => {
    it('student ?????? ??????', async () => {
      //given
      studentRepository.findOne.mockReturnValue(null);
      try {
        //when
        await service.isStudentIsAuthentic('1', {
          name: 'asd',
          studentID: 123,
        });
      } catch (e) {
        //then
        expect(e).toBeInstanceOf(UnauthorizedException);
      }
    });
  });

  describe('uploadAnswer', () => {
    it('??????(student ??????)', async () => {
      try {
        const updateDTO = { name: '??????', studentID: '170604' };
        studentRepository.findOne.mockReturnValue(null);
        await service.uploadAnswer('1', updateDTO, {} as Express.Multer.File);
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
      }
    });
    //????????? ????????? ?????? ??????????????? ??????
  });

  describe('checkSelfAuthentication', () => {
    it('??????(student ??????)', async () => {
      try {
        const updateDTO = { name: '??????', studentID: '170604' };
        studentRepository.findOne.mockReturnValue(null);
        await service.checkSelfAuthentication(
          '1',
          updateDTO,
          {} as Express.Multer.File,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
      }
    });
  });

  describe('uploadSelfAuthenticationImage', () => {
    it('??????(student ??????)', async () => {
      try {
        const updateDTO = { name: '??????', studentID: '170604' };
        studentRepository.findOne.mockReturnValue(null);
        await service.uploadSelfAuthenticationImage(
          '1',
          updateDTO,
          {} as Express.Multer.File,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
      }
    });
    //????????? ????????? ?????? ??????????????? ??????
  });

  describe('update', () => {
    it('??????', async () => {
      const updateDTO = { name: '??????' };
      const studentData = { ExamId: '1' };
      studentRepository.findOne.mockReturnValue(studentData);
      examUsersRepository.find.mockReturnValue([{ UserId: '1' }]);
      await service.update('1', '1', '1', updateDTO);
      expect(studentRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('??????', async () => {
      const studentData = { ExamId: '1' };
      studentRepository.findOne.mockReturnValue(studentData);
      examUsersRepository.find.mockReturnValue([{ UserId: '1' }]);
      await service.remove('1', '1', '1');
      expect(studentRepository.softDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('validateUserExam', () => {
    it('??????(examUsers ??????)', async () => {
      try {
        examUsersRepository.find.mockReturnValue(null);
        await service.validateUserExam('0', '0');
      } catch (e) {
        expect(e.message).toBe(NEED_AUTHENTIFICATION);
        expect(e).toBeInstanceOf(UnauthorizedException);
      }
    });
    it('??????(????????? ????????????)', async () => {
      try {
        examUsersRepository.find.mockReturnValue([{ UserId: '1' }]);
        await service.validateUserExam('0', '0');
      } catch (e) {
        expect(e.message).toBe(NEED_AUTHENTIFICATION);
        expect(e).toBeInstanceOf(UnauthorizedException);
      }
    });
    it('??????', async () => {
      examUsersRepository.find.mockReturnValue([{ UserId: '0' }]);
      await service.validateUserExam('0', '0');
    });
  });

  describe('validateStudentInExam', () => {
    it('??????(student ??????)', async () => {
      try {
        studentRepository.findOne.mockReturnValue(null);
        await service.validateStudentInExam('0', '0');
      } catch (e) {
        expect(e.message).toBe(NEED_AUTHENTIFICATION);
        expect(e).toBeInstanceOf(UnauthorizedException);
      }
    });
    it('??????(student.examid !==examid)', async () => {
      try {
        studentRepository.findOne.mockReturnValue({ ExamId: '1' });
        await service.validateStudentInExam('0', '0');
      } catch (e) {
        expect(e.message).toBe(NEED_AUTHENTIFICATION);
        expect(e).toBeInstanceOf(UnauthorizedException);
      }
    });
    it('??????', async () => {
      const studentData = { ExamId: '0' };
      studentRepository.findOne.mockReturnValue(studentData);
      const result = await service.validateStudentInExam('0', '0');
      expect(result).toStrictEqual(studentData);
    });
  });
});
