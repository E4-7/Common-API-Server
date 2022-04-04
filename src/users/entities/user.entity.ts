import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { CommonEntity } from '../../common/abstract/common.entity';
import { UserStatus } from '../constants/user-status.enum';
import { Role } from './role.entity';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../constants/user-role.enum';

@Index('email', ['email'], { unique: true })
@Entity()
export class Users extends CommonEntity {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'happyjarban@gmail.com',
    description: '이메일',
  })
  @Column('varchar', { name: 'email', unique: true, length: 30 })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'thisispassword',
    description: '비밀번호',
  })
  @Column('varchar', { name: 'password', length: 100, select: false })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '조찬민',
    description: '실명',
  })
  @Column('varchar', { name: 'name', length: 30 })
  name: string;

  @IsEnum(UserStatus)
  @IsNotEmpty()
  @ApiProperty({
    example: '0',
    description: '유저 상태(일반, 삭제, 정지)',
  })
  @Column('enum', {
    name: 'status',
    enum: UserStatus,
    default: UserStatus.NORMAL,
  })
  status: UserStatus;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @IsEnum(UserRole)
  @IsNotEmpty()
  @ApiProperty({
    example: '0',
    description: '역할(조교, 교수)',
  })
  @ManyToOne(() => Role, (role) => role.Users, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'RoleId', referencedColumnName: 'id' }])
  Role: Role;
}
