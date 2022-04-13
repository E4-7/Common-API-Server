import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from '../users/entities/user.entity';
import { ForbiddenException } from '@nestjs/common';
import { NO_EXIST_USER, WRONG_USER_ACCOUNT } from '../users/constants/constant';
import { Roles } from '../users/entities/role.entity';
import {
  MockRepository,
  mockRepository,
} from '../../common/constants/repository-mock.constant';

const userData = {
  email: 'happyjarban10@gmail.com',
  name: '조찬민',
  deletedAt: null,
  id: 10,
  createdAt: '2022-04-11T05:33:50.255Z',
  updatedAt: '2022-04-11T05:33:50.255Z',
  status: 1,
  Role: {
    type: 2,
  },
  password: 'thisispassword',
};

describe('AuthService', () => {
  let module: TestingModule;
  let service: AuthService;
  let userRepository: MockRepository<Users>;
  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Users),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Roles),
          useValue: mockRepository(),
        },
      ],
    }).compile();
    userRepository = module.get<MockRepository<Users>>(
      getRepositoryToken(Users),
    );
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    const email = 'happyjarban@gmail.com';
    const password = 'thisispassword';
    it('유저가 존재하지 않을 경우', async () => {
      //given
      userRepository.createQueryBuilder().getOne.mockReturnValue(null);
      //when
      try {
        await service.validateUser(email, password);
      } catch (e) {
        //then
        expect(e).toBeInstanceOf(ForbiddenException);
        expect(e.message).toBe(NO_EXIST_USER);
      }
    });
    it('유저의 password가 일치하지 않을 경우', async () => {
      //given
      userRepository.createQueryBuilder().getOne.mockReturnValue(userData);
      //when
      try {
        await service.validateUser(email, 'WrongPassword');
      } catch (e) {
        //then
        expect(e).toBeInstanceOf(ForbiddenException);
        expect(e.message).toBe(WRONG_USER_ACCOUNT);
      }
    });
    it('유저의 id, password가 일치', async () => {
      userRepository.createQueryBuilder().getOne.mockReturnValue(userData);
      expect(service.validateUser(email, password)).resolves.toEqual(userData);
    });
  });
});
