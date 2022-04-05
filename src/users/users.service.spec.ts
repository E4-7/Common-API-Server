import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { createTestConfiguration } from '../utils/createt.test.configuration';
import bcrypt from 'bcrypt';
import { ForbiddenException, HttpStatus } from '@nestjs/common';
import { ALREADY_EXIST_USER } from './constants/constant';
import { UserRole } from './constants/user-role.enum';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<Users>;
  let roleRepository: Repository<Role>;
  let user;
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(createTestConfiguration([Users, Role])),
        TypeOrmModule.forFeature([Users, Role]),
      ],
      providers: [UsersService],
    }).compile();
    userRepository = module.get<Repository<Users>>(getRepositoryToken(Users));
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    service = module.get<UsersService>(UsersService);

    //Role Mocking
    await roleRepository.save({ id: 1, type: 2, description: '교수' });
    await roleRepository.save({ id: 2, type: 1, description: '조교' });

    const hashedPassword = await bcrypt.hash('thisispassword', 12);
    user = await userRepository.save({
      name: '조찬민',
      password: hashedPassword,
      email: 'happyjarban@gmail.com',
    });
  });

  afterAll(async () => {
    await roleRepository.delete({ id: 1 });
    await roleRepository.delete({ id: 2 });
    await userRepository.clear();
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findByEmail은 이메일을 통해 유저를 찾아야 함', () => {
    expect(service.findByEmail('happyjarban@gmail.com')).resolves.toEqual({
      email: user.email,
      id: user.id,
      password: user.password,
    });
  });

  describe('회원가입', () => {
    it('아이디가 존재 O ', () => {
      expect(
        service.join('happyjarban@gmail.com', '조찬민', 'thisispassword'),
      ).rejects.toThrowError(new ForbiddenException(ALREADY_EXIST_USER));
    });
    it('잘못된 role Id 줬을 경우', async () => {
      try {
        const data = await service.join(
          'role@gmail.com',
          '조찬민',
          'thisispassword',
          3,
        );
      } catch (e) {
        expect(e.response.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      }
    });
    it('아이디가 존재 x', async () => {
      const data = await service.join(
        'happyjarban2@gmail.com',
        '조찬민',
        'thisispassword',
      );
      expect(data.email).toBe('happyjarban2@gmail.com');
    });
    it('아이디가 존재 x(조교)', async () => {
      const data = await service.join(
        'happyjarban3@gmail.com',
        '조찬민',
        'thisispassword',
        UserRole.ASSISTANT,
      );
      expect(data.Role.description).toBe('조교');
    });
  });
});
