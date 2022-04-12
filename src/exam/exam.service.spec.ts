import { Test, TestingModule } from '@nestjs/testing';
import { ExamService } from './exam.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Exams } from './entities/exam.entity';
import { ExamUsers } from './entities/examusers.entity';
import {
  mockConnection,
  mockRepository,
  MockRepository,
} from '../common/constants/repository.type';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { Connection } from 'typeorm';
import { NEED_AUTHENTIFICATION } from '../common/constants/error';
import {
  MockexamUserDataArray,
  MocknewExamDataColumn,
  MockoneExamData,
} from './exam.service.mock';

const myUserID = 1,
  myExamID = 1;
describe('ExamService', () => {
  let service: ExamService;
  let examRepository: MockRepository<Exams>;
  let examUsersRepository: MockRepository<ExamUsers>;
  let connection;
  //initial datas
  let newExamDataColumn;
  let examUserDataArray;
  let oneExamData;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamService,
        {
          provide: getRepositoryToken(Exams),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(ExamUsers),
          useValue: mockRepository(),
        },
        Logger,
        {
          provide: Connection,
          useValue: mockConnection(),
        },
      ],
    }).compile();
    connection = module.get(Connection);
    service = module.get<ExamService>(ExamService);
    examRepository = module.get<MockRepository<Exams>>(
      getRepositoryToken(Exams),
    );
    examUsersRepository = module.get<MockRepository<ExamUsers>>(
      getRepositoryToken(ExamUsers),
    );
    newExamDataColumn = Object.assign({}, MockexamUserDataArray);
    oneExamData = Object.assign({}, MockoneExamData);
    newExamDataColumn = Object.assign({}, MocknewExamDataColumn);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('쿼리빌더 테스트', async () => {
      //given
      //when
      await service.findAll(0);
      //then
      expect(examUsersRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(
        examUsersRepository.createQueryBuilder().leftJoin,
      ).toHaveBeenCalledTimes(1);
    });
    it('성공 테스트', async () => {
      //given
      jest
        .spyOn(examUsersRepository.createQueryBuilder(), 'getMany')
        .mockResolvedValue(examUserDataArray);
      //when
      const result = await service.findAll(0);
      //then
      expect(
        examUsersRepository.createQueryBuilder().getMany,
      ).toHaveBeenCalled();
      expect(result).toEqual(examUserDataArray);
    });
  });

  describe('create', () => {
    let qr;
    beforeEach(async () => {
      qr = connection.createQueryRunner();
    });
    it('Transaction 실패 테스트', async () => {
      const temp = qr.manager.create;
      qr.manager.create = new Error('occur Error');
      try {
        await service.create(newExamDataColumn, 0);
      } catch (e) {}
      expect(qr.rollbackTransaction).toHaveBeenCalled();
      expect(qr.release).toHaveBeenCalled();
      qr.manager.create = temp;
      //expect(service.create());
    });
    it('성공케이스', async () => {
      qr.manager.create = jest.fn().mockReturnValue(oneExamData);
      const data = await service.create(newExamDataColumn, 0);
      expect(qr.connect).toHaveBeenCalled();
      expect(qr.startTransaction).toHaveBeenCalled();
      expect(qr.manager.save).toHaveBeenCalledTimes(2);
      expect(qr.manager.create).toHaveBeenCalledTimes(2);
      expect(qr.commitTransaction).toHaveBeenCalled();
      expect(qr.release).toHaveBeenCalled();
      expect(data).toEqual(oneExamData);
    });
  });

  describe('update', () => {
    it('fineOne 메소드 작동여부', async () => {
      try {
        await service.update(-1, -1, newExamDataColumn);
      } catch (e) {}
      expect(examRepository.findOne).toHaveBeenCalledTimes(1);
      expect(examRepository.findOne).toHaveBeenCalledWith({ id: -1 });
    });
    it('본인의 시험번호가 아닐 경우', async () => {
      try {
        examRepository.findOne.mockResolvedValue(oneExamData);
        //when
        await service.update(2, myExamID, newExamDataColumn);
      } catch (e) {
        //then
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toBe(NEED_AUTHENTIFICATION);
      }
    });
    it('해당 시험번호가 존재하지 않는 경우', async () => {
      try {
        //when
        examRepository.findOne.mockResolvedValue({});
        await service.update(myUserID, 2, newExamDataColumn);
      } catch (e) {
        //then
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toBe(NEED_AUTHENTIFICATION);
      }
    });
    it('정상작동(잘 업데이트 됨)', async () => {
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
    it('fineOne 메소드 작동여부', async () => {
      try {
        await service.delete(-1, -1);
      } catch (e) {}
      expect(examRepository.findOne).toHaveBeenCalledTimes(1);
      expect(examRepository.findOne).toHaveBeenCalledWith({ id: -1 });
    });
    it('본인의 시험번호가 아닐 경우', async () => {
      try {
        //given
        examRepository.findOne.mockResolvedValue(oneExamData);
        //when
        await service.delete(0, myExamID);
      } catch (e) {
        //then
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toBe(NEED_AUTHENTIFICATION);
      }
    });
    it('해당 시험번호가 존재하지 않는 경우', async () => {
      try {
        //given
        examRepository.findOne.mockResolvedValue({});
        //when
        await service.delete(myUserID, 2);
      } catch (e) {
        //then
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toBe(NEED_AUTHENTIFICATION);
      }
    });
    it('정상작동(잘 삭제됨)', async () => {
      //given
      examRepository.findOne.mockResolvedValue(oneExamData);
      //when
      await service.delete(myUserID, myExamID);
      //then
      expect(examRepository.delete).toHaveBeenCalledTimes(1);
      expect(examRepository.delete).toHaveBeenCalledWith({ id: myExamID });
    });
  });
});
