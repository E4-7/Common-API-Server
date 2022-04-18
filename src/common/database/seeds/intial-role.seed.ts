import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { Roles } from '../../../modules/users/entities/roles.entity';
import { UserRole } from '../../../modules/users/constants/user-role.enum';

export class CreateInitialData implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    /**
     * intialize role-data
     */
    await connection
      .createQueryBuilder()
      .insert()
      .into(Roles)
      .values([
        { type: UserRole.PROFESSOR, description: '교수' },
        { type: UserRole.ASSISTANT, description: '조교' },
      ])
      .execute();
  }
}
