import { Test, TestingModule } from '@nestjs/testing';
import { ExamService } from './exam.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Exams } from './entities/exam.entity';
import { ExamUsers } from './entities/examusers.entity';
import { Repository } from 'typeorm';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const mockRepository = () => ({
  createQueryBuilder: jest.fn().mockReturnValue({
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockReturnThis(),
  }),
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('ExamService', () => {
  let service: ExamService;
  let examRepository: MockRepository<Exams>;
  let examUsersRepository: MockRepository<ExamUsers>;
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
      ],
    }).compile();

    service = module.get<ExamService>(ExamService);
    examRepository = module.get<MockRepository<Exams>>(
      getRepositoryToken(Exams),
    );
    examUsersRepository = module.get<MockRepository<ExamUsers>>(
      getRepositoryToken(ExamUsers),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('exam create 테스트', () => {
    //given
    //when
    //then
  });

  describe('findAll 서비스 테스트 ', () => {
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
  });
});
