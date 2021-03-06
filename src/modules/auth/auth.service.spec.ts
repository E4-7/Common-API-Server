import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException } from '@nestjs/common';
import { NO_EXIST_USER, WRONG_USER_ACCOUNT } from '../users/constants/constant';
import {
  MockRepository,
  mockRepository,
} from '../../common/constants/repository-mock.constant';
import bcrypt from 'bcrypt';
import { UsersRepository } from '../users/repositories/users.repository';
import { RolesRepository } from '../users/repositories/roles.repository';

const userData = {
  email: 'happyjarban10@gmail.com',
  name: '조찬민',
  deleted_at: null,
  id: 10,
  created_at: '2022-04-11T05:33:50.255Z',
  updated_at: '2022-04-11T05:33:50.255Z',
  status: 1,
  Role: {
    type: 2,
  },
  password: 'thisispassword',
};

describe('AuthService', () => {
  let module: TestingModule;
  let service: AuthService;
  let userRepository: MockRepository<UsersRepository>;
  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UsersRepository),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(RolesRepository),
          useValue: mockRepository(),
        },
      ],
    }).compile();
    userRepository = module.get<MockRepository<UsersRepository>>(
      getRepositoryToken(UsersRepository),
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
      const userDataHashPassword = Object.assign({}, userData);
      userDataHashPassword.Role = Object.assign({}, userData.Role);
      userDataHashPassword.password = await bcrypt.hash(
        userDataHashPassword.password,
        12,
      );
      const { password, ...userWithoutPassword } = userData;
      userRepository
        .createQueryBuilder()
        .getOne.mockReturnValue(userDataHashPassword);
      expect(service.validateUser(email, password)).resolves.toEqual(
        userWithoutPassword,
      );
    });
  });
});
