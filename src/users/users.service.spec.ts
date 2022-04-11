import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { Role } from './entities/role.entity';
import {
  ForbiddenException,
  HttpStatus,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ALREADY_EXIST_USER } from './constants/constant';
import { UserRole } from './constants/user-role.enum';
import {
  MockRepository,
  mockRepository,
} from '../common/constants/repository.type';
import { userData, userDataAssistant } from './user.service.mock';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: MockRepository<Users>;
  let roleRepository: MockRepository<Role>;
  let module: TestingModule;
  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(Users),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Role),
          useValue: mockRepository(),
        },
      ],
    }).compile();
    userRepository = module.get<MockRepository<Users>>(
      getRepositoryToken(Users),
    );
    roleRepository = module.get<MockRepository<Role>>(getRepositoryToken(Role));
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findByEmail', () => {
    const email = 'happyjarban@gmail.com';
    userRepository.findOne.mockReturnValue(userData);
    expect(service.findByEmail(email)).resolves.toEqual(userData);
    expect(userRepository.findOne).toBeCalledWith({
      where: { email },
      select: ['id', 'email'],
    });
  });

  describe('join', () => {
    const email = 'happyjarban@gmail.com';
    const name = '조찬민';
    const password = 'thisispassword';

    it('이미 존재하는 아이디', () => {
      userRepository.findOne.mockReturnValue(userData);
      expect(service.join(email, name, password)).rejects.toThrowError(
        new ForbiddenException(ALREADY_EXIST_USER),
      );
    });
    it('잘못된 roleId 경우', async () => {
      try {
        userRepository.findOne.mockReturnValue(null);
        roleRepository.findOne.mockReturnValue(null);
        const invalidRoleTypeID = 100;
        const data = await service.join(
          email,
          name,
          password,
          invalidRoleTypeID,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(UnprocessableEntityException);
        expect(e.response.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      }
    });
    it('아이디가 존재 x(정상)[교수]', async () => {
      userRepository.findOne.mockReturnValue(null);
      userRepository.save.mockReturnValue(userData);
      roleRepository.findOne.mockReturnValue({});
      const data = await service.join(email, name, password);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(data.Role.type).toBe(UserRole.PROFESSOR);
    });
    it('아이디가 존재 x(조교)', async () => {
      userRepository.findOne.mockReturnValue(null);
      userRepository.save.mockReturnValue(userDataAssistant);
      roleRepository.findOne.mockReturnValue({});
      const data = await service.join(
        email,
        name,
        password,
        UserRole.ASSISTANT,
      );
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(data.Role.type).toBe(UserRole.ASSISTANT);
    });
  });
});
