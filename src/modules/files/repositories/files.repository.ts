import { EntityRepository } from 'typeorm';
import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { Files } from '../entities/files.entity';

@EntityRepository(Files)
export class FilesRepository extends BaseRepository<Files> {}
