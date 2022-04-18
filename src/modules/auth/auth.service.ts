import { ForbiddenException, Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { NO_EXIST_USER, WRONG_USER_ACCOUNT } from '../users/constants/constant';
import { UsersRepository } from '../users/repositories/users.repository';

@Injectable()
export class AuthService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersRepository
      .createQueryBuilder('Users')
      .leftJoin('Users.Role', 'Role')
      .where('Users.email = :email', { email })
      .select([
        'Role.type',
        'Users.id',
        'Users.email',
        'Users.password',
        'Users.created_at',
        'Users.updated_at',
        'Users.name',
        'Users.status',
        'Users.password',
      ])
      .getOne();

    if (!user) {
      throw new ForbiddenException(NO_EXIST_USER);
    }
    const result = await bcrypt.compare(password, user.password);
    if (result) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    throw new ForbiddenException(WRONG_USER_ACCOUNT);
  }
}
