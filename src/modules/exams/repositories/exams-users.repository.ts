import { EntityRepository } from 'typeorm';
import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { ExamUsers } from '../entities/exams-users.entity';

@EntityRepository(ExamUsers)
export class ExamsUsersRepository extends BaseRepository<ExamUsers> {}
