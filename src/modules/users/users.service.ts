import {
  ForbiddenException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { Users } from './entities/users.entity';
import { UserRole } from './constants/user-role.enum';
import { Roles } from './entities/roles.entity';
import { ALREADY_EXIST_USER } from './constants/constant';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private usersRepository: Repository<Users>,
    @InjectRepository(Roles) private roleRepository: Repository<Roles>,
  ) {}

  async findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email'],
    });
  }

  async join(
    email: string,
    name: string,
    password: string,
    type: UserRole = UserRole.PROFESSOR,
  ) {
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ForbiddenException(ALREADY_EXIST_USER);
    }
    const roleData = await this.roleRepository.findOne({
      where: { type },
    });
    if (!roleData) {
      throw new UnprocessableEntityException();
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await this.usersRepository.save({
      email,
      name,
      password: hashedPassword,
      Role: roleData,
    });
    //내 정보조회, 로그인과 컬럼을 맞춰주기 위함
    const { Role, ...exceptRoleUserData } = user;
    exceptRoleUserData['Role'] = { type: Role.type };
    delete user.RoleId;

    return user;
  }
}
