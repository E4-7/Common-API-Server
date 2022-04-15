import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { Users } from '../users/entities/users.entity';

@Injectable()
export class LocalSerializer extends PassportSerializer {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(Users) private usersRepository: Repository<Users>,
  ) {
    super();
  }

  serializeUser(user: Users, done: CallableFunction) {
    done(null, user.id);
  }

  async deserializeUser(userId: string, done: CallableFunction) {
    return await this.usersRepository
      .createQueryBuilder('Users')
      .leftJoin('Users.Role', 'Role')
      .where('Users.id = :id', { id: +userId })
      .select([
        'Role.type',
        'Users.id',
        'Users.email',
        'Users.created_at',
        'Users.updated_at',
        'Users.name',
        'Users.status',
      ])
      .getOne()
      .then((user) => {
        done(null, user);
      })
      .catch((error) => done(error));
  }
}
