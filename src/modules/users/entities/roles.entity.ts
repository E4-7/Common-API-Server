import { Column, Entity, OneToMany } from 'typeorm';
import { UserRole } from '../constants/user-role.enum';
import { Users } from './users.entity';
import { CommonIdEntity } from '../../../common/abstract/common-id.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Roles extends CommonIdEntity {
  @ApiProperty({
    example: { type: 1 },
    enum: UserRole,
    description: '역할(조교, 교수)',
  })
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
