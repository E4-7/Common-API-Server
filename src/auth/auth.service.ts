import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Users } from '../users/entities/user.entity';
import { NO_EXIST_USER, WRONG_USER_ACCOUNT } from '../users/constants/constant';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users) private usersRepository: Repository<Users>,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'createdAt',
        'updatedAt',
        'name',
        'status',
      ],
      relations: ['Role'],
    });
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
