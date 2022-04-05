import {
  ForbiddenException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { Users } from './entities/user.entity';
import { UserRole } from './constants/user-role.enum';
import { Role } from './entities/role.entity';
import { ALREADY_EXIST_USER } from './constants/constant';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private usersRepository: Repository<Users>,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
  ) {}

  async findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password'],
    });
  }

  async join(
    email: string,
    name: string,
    password: string,
    type: UserRole = UserRole.PROFESSOR,
  ) {
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ForbiddenException(ALREADY_EXIST_USER);
    }
    const Role = await this.roleRepository.findOne({
      where: { type },
    });
    if (!Role) {
      throw new UnprocessableEntityException();
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await this.usersRepository.save({
      email,
      name,
      password: hashedPassword,
      Role,
    });

    return user;
  }
}
