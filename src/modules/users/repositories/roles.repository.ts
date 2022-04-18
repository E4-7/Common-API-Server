import { EntityRepository } from 'typeorm';
import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { Roles } from '../entities/roles.entity';

@EntityRepository(Roles)
export class RolesRepository extends BaseRepository<Roles> {}
