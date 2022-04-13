import { CommonEntity } from '../../../common/abstract/common.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { UserRole } from '../constants/user-role.enum';
import { Users } from './user.entity';

@Entity()
export class Roles extends CommonEntity {
  @Column('enum', {
    name: 'type',
    enum: UserRole,
    default: UserRole.PROFESSOR,
    unique: true,
  })
  type: UserRole;

  @Column('varchar', {
    name: 'description',
    unique: true,
    length: 10,
    nullable: false,
  })
  description: string;

  @OneToMany(() => Users, (users) => users.Role)
  Users: Users[];
}
