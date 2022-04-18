import { EntityRepository } from 'typeorm';
import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { Users } from '../entities/users.entity';

@EntityRepository(Users)
export class UsersRepository extends BaseRepository<Users> {}
