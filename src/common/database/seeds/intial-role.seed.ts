import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { Role } from '../../../modules/users/entities/role.entity';
import { UserRole } from '../../../modules/users/constants/user-role.enum';

export class CreateInitialData implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    /**
     * intialize role-data
     */
    await connection
      .createQueryBuilder()
      .insert()
      .into(Role)
      .values([
        { type: UserRole.PROFESSOR, description: '교수' },
        { type: UserRole.ASSISTANT, description: '조교' },
      ])
      .execute();
  }
}
