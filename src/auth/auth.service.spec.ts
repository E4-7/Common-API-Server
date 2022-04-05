import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { createTestConfiguration } from '../utils/createt.test.configuration';
import { ForbiddenException } from '@nestjs/common';
import { NO_EXIST_USER, WRONG_USER_ACCOUNT } from '../users/constants/constant';
import { Role } from '../users/entities/role.entity';
import bcrypt from 'bcrypt';

describe('AuthService', () => {
  let module: TestingModule;
  let service: AuthService;
  let repository: Repository<Users>;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(createTestConfiguration([Users, Role])),
        TypeOrmModule.forFeature([Users]),
      ],
      providers: [AuthService],
    }).compile();
    repository = module.get<Repository<Users>>(getRepositoryToken(Users));
    service = module.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await repository.clear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('passport strategy 유저(관리자) 로그인', () => {
    let userId;
    beforeAll(async () => {
      const hashedPassword = await bcrypt.hash('thisispassword', 12);
      const data = await repository.save({
        email: 'happyjarban@gmail.com',
        password: hashedPassword,
        name: '조찬민',
      });
      userId = data.id;
    });
    it('유저가 존재하지 않을 경우 예외를 던진다.', async () => {
      await expect(
        service.validateUser('happyjarban2@gmail.com', 'thisispassword'),
      ).rejects.toThrowError(new ForbiddenException(NO_EXIST_USER));
    });
    it('유저의 password가 일치하지 않을 경우, 예외를 던진다.', async () => {
      await expect(
        service.validateUser('happyjarban@gmail.com', 'thisispasword2'),
      ).rejects.toThrowError(new ForbiddenException(WRONG_USER_ACCOUNT));
    });
    it('유저의 id, password가 일치하면, 유저의 정보를 반환한다.', async () => {
      await expect(
        service.validateUser('happyjarban@gmail.com', 'thisispassword'),
      ).resolves.toBeInstanceOf(Object);
    });
  });
});
