import { Test, TestingModule } from '@nestjs/testing';
import { ExamsService } from './exams.service';
import {
  mockRepository,
  MockRepository,
} from '../../common/constants/repository-mock.constant';
import {
  Logger,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  CANT_DELETE_MYSELF,
  NEED_AUTHENTIFICATION,
} from '../../common/constants/error.constant';
import {
  MockexamUserDataArray,
  MocknewExamDataColumn,
  MockoneExamData,
} from './exams.service.mock';
import { FilesService } from '../files/files.service';
import { mockFileService } from '../files/files.mock';
import { ExamsRepository } from './repositories/exams.repository';
import { ExamsUsersRepository } from './repositories/exams-users.repository';
import { FilesRepository } from '../files/repositories/files.repository';
import { UsersService } from '../users/users.service';
import { ExamUsers } from './entities/exams-users.entity';
import { mockUserService, signupData } from '../users/user.service.mock';
import { ConfigService } from '@nestjs/config';

const myUserID = '1',
  myExamID = '1';

jest.mock('typeorm-transactional-cls-hooked', () => ({
  Transactional: () => () => ({}),
  BaseRepository: class {},
}));

describe('ExamService', () => {
  let service: ExamsService;
  let fileService: FilesService;
  let userService: UsersService;
  let examRepository: MockRepository;
  let examUsersRepository: MockRepository;
  //initial datas
  let newExamDataColumn;
  let examUserDataArray;
  let oneExamData;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        {
          module: class FakeModule {},
          providers: [{ provide: FilesService, useValue: mockFileService }],
          exports: [FilesService],
        },
        {
          module: class FakeModule {},
          providers: [{ provide: UsersService, useValue: mockUserService }],
          exports: [UsersService],
        },
      ],
      providers: [
        ExamsService,
        ConfigService,
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

        Logger,
      ],
    }).compile();

    service = module.get<ExamsService>(ExamsService);
    fileService = module.get(FilesService);
    userService = module.get(UsersService);
    examRepository = module.get(ExamsRepository);
    examUsersRepository = module.get(ExamsUsersRepository);
    examUserDataArray = Object.assign({}, MockexamUserDataArray);
    oneExamData = Object.assign({}, MockoneExamData);
    newExamDataColumn = Object.assign({}, MocknewExamDataColumn);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findMyExamAll', () => {
    it('???????????? ?????????', async () => {
      //given
      //when
      await service.findMyExamAll('0');
      //then
      expect(examUsersRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(
        examUsersRepository.createQueryBuilder().leftJoin,
      ).toHaveBeenCalledTimes(2);
    });
    it('?????? ?????????', async () => {
      //given
      jest
        .spyOn(examUsersRepository.createQueryBuilder(), 'getMany')
        .mockResolvedValue(examUserDataArray);
      //when
      const result = await service.findMyExamAll('0');
      //then
      expect(
        examUsersRepository.createQueryBuilder().getMany,
      ).toHaveBeenCalled();
      expect(result).toEqual(examUserDataArray);
    });
  });

  describe('create', () => {
    it('???????????????', async () => {
      examRepository.create.mockReturnValue(oneExamData);
      examUsersRepository.create.mockReturnValue(new ExamUsers());
      const result = await service.create(newExamDataColumn, '1');
      expect(examRepository.create).toHaveBeenCalledTimes(1);
      expect(examRepository.save).toHaveBeenCalledTimes(1);
      expect(examUsersRepository.create).toHaveBeenCalledTimes(1);
      expect(examUsersRepository.create).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(oneExamData);
    });
  });

  describe('update', () => {
    it('fineOne ????????? ??????', async () => {
      try {
        await service.update('-1', '-1', newExamDataColumn);
      } catch (e) {}
      expect(examRepository.findOne).toHaveBeenCalledTimes(1);
      expect(examRepository.findOne).toHaveBeenCalledWith({
        where: { id: '-1' },
        relations: ['ExamPaper'],
      });
    });
    it('????????? ??????????????? ?????? ??????', async () => {
      try {
        examRepository.findOne.mockResolvedValue(oneExamData);
        //when
        await service.update('2', myExamID, newExamDataColumn);
      } catch (e) {
        //then
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toBe(NEED_AUTHENTIFICATION);
      }
    });
    it('?????? ??????????????? ???????????? ?????? ??????', async () => {
      try {
        //when
        examRepository.findOne.mockResolvedValue({});
        await service.update(myUserID, '2', newExamDataColumn);
      } catch (e) {
        //then
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toBe(NEED_AUTHENTIFICATION);
      }
    });
    it('????????????(??? ???????????? ???)', async () => {
      examRepository.findOne.mockResolvedValue(oneExamData);
      //when
      const data = await service.update(myUserID, myExamID, newExamDataColumn);
      //then
      oneExamData.is_openbook = false;
      expect(examRepository.save).toHaveBeenCalledTimes(1);
      expect(data).toEqual(oneExamData);
    });
  });

  describe('delete', () => {
    it('fineOne ????????? ????????????', async () => {
      try {
        await service.delete('-1', '-1');
      } catch (e) {}
      expect(examRepository.findOne).toHaveBeenCalledTimes(1);
      expect(examRepository.findOne).toHaveBeenCalledWith({ id: '-1' });
    });
    it('????????? ??????????????? ?????? ??????', async () => {
      try {
        //given
        examRepository.findOne.mockResolvedValue(oneExamData);
        //when
        await service.delete('0', myExamID);
      } catch (e) {
        //then
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toBe(NEED_AUTHENTIFICATION);
      }
    });
    it('?????? ??????????????? ???????????? ?????? ??????', async () => {
      try {
        //given
        examRepository.findOne.mockResolvedValue({});
        //when
        await service.delete(myUserID, '2');
      } catch (e) {
        //then
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toBe(NEED_AUTHENTIFICATION);
      }
    });
    it('????????????(??? ?????????)', async () => {
      //given
      examRepository.findOne.mockResolvedValue(oneExamData);
      //when
      await service.delete(myUserID, myExamID);
      //then
      expect(examRepository.delete).toHaveBeenCalledTimes(1);
      expect(examRepository.delete).toHaveBeenCalledWith({ id: myExamID });
    });
  });

  describe('uploadPaper', () => {
    it('examId??? ?????? x or ????????? ??? ????????? ??????', async () => {
      try {
        examRepository.findOne.mockResolvedValue(oneExamData);
        //when
        await service.uploadPaper('2', myExamID, newExamDataColumn);
      } catch (e) {
        //then
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toBe(NEED_AUTHENTIFICATION);
      }
    });
    it('???????????? ?????? ?????? ???????????? ????????? ?????????', async () => {
      examRepository.findOne.mockResolvedValue(oneExamData);
      //when
      await service.uploadPaper(myUserID, myExamID, newExamDataColumn);
      expect(fileService.deleteFile).toHaveBeenCalledTimes(0);
      expect(fileService.uploadFile).toHaveBeenCalledWith(newExamDataColumn);
      expect(examRepository.save).toHaveBeenCalledTimes(1);
    });
    it('???????????? ?????? ?????? ???????????? ???????????? ?????????', async () => {
      const haveExamPaper = Object.assign({}, oneExamData);
      haveExamPaper.ExamPaper = { key: 'aa' };
      examRepository.findOne.mockResolvedValue(haveExamPaper);
      await service.uploadPaper(myUserID, myExamID, newExamDataColumn);
      expect(fileService.deleteFile).toHaveBeenCalledTimes(1);
      expect(fileService.uploadFile).toHaveBeenCalledWith(newExamDataColumn);
      expect(examRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('createAssistant', () => {
    it('?????? ?????? ????????? ????????? ?????? ??????', async () => {
      try {
        examRepository.findOne.mockResolvedValue(oneExamData);
        //when
        await service.createAssistant(signupData, '2', '2');
      } catch (e) {
        //then
        expect(e.message).toBe(NEED_AUTHENTIFICATION);
        expect(e).toBeInstanceOf(UnauthorizedException);
      }
    });
    // userService??? ????????? ??????????????? ????????? x
  });

  describe('deleteAssistant', () => {
    it('?????? ????????? ?????? ?????? ??????', async () => {
      try {
        examRepository.findOne.mockResolvedValue(oneExamData);
        //when
        await service.deleteAssistant('1', '1', '1');
      } catch (e) {
        //then
        expect(e).toBeInstanceOf(UnprocessableEntityException);
        expect(e.message).toBe(CANT_DELETE_MYSELF);
      }
    });
    it('?????? ?????? ????????? ????????? ?????? ?????? ', async () => {
      try {
        examRepository.findOne.mockResolvedValue(oneExamData);
        //when
        await service.deleteAssistant('2', myExamID, newExamDataColumn);
      } catch (e) {
        //then
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toBe(NEED_AUTHENTIFICATION);
      }
    });

    it('?????? ????????? ???????????? ????????? ?????? ?????? ', async () => {
      try {
        examRepository.findOne.mockResolvedValue(oneExamData);
        examUsersRepository.findOne.mockReturnValue(null);
        //when
        await service.deleteAssistant('1', myExamID, newExamDataColumn);
      } catch (e) {
        //then
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toBe(NEED_AUTHENTIFICATION);
      }
    });
    it('?????? ??????', async () => {
      examRepository.findOne.mockResolvedValue(oneExamData);
      examUsersRepository.findOne.mockReturnValue({});
      //when
      await service.deleteAssistant('1', myExamID, newExamDataColumn);
      expect(userService.delete).toHaveBeenCalledTimes(1);
    });
  });
});
