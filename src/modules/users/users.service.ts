import {
  ForbiddenException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { UserRole } from './constants/user-role.enum';
import { ALREADY_EXIST_USER } from './constants/constant';
import { UsersRepository } from './repositories/users.repository';
import { RolesRepository } from './repositories/roles.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rolesRepository: RolesRepository,
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
    const roleData = await this.rolesRepository.findOne({
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
