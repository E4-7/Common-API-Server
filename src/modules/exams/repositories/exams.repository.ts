import { EntityRepository } from 'typeorm';
import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { Exams } from '../entities/exams.entity';

@EntityRepository(Exams)
export class ExamsRepository extends BaseRepository<Exams> {}
