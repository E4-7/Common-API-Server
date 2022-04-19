import { EntityRepository } from 'typeorm';
import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { Students } from '../entities/student.entity';

@EntityRepository(Students)
export class StudentsRepository extends BaseRepository<Students> {}
