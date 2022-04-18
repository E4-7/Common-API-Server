import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CommonEntity } from '../../../common/abstract/common.entity';
import { UserStatus } from '../constants/user-status.enum';
import { Roles } from './roles.entity';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Exams } from '../../exams/entities/exams.entity';
import { ExamUsers } from '../../exams/entities/exams-users.entity';

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
  deleted_at: Date | null;

  //역할 컬럼 시작
  @IsObject()
  @IsNotEmpty()
  @ApiProperty({
    example: { type: 1 },
    description: '역할(조교, 교수)',
  })
  @ManyToOne(() => Roles, (role) => role.Users, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'RoleId', referencedColumnName: 'id' }])
  Role: Roles;

  @Column('int', { name: 'RoleId', nullable: true })
  RoleId: number | null;

  //역할 컬럼 끝

  //user<->exams 테이블 컬럼
  @ManyToMany(() => Exams, (exams) => exams.Users)
  @JoinTable({
    name: 'examusers',
    joinColumn: {
      name: 'UserId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'ExamId',
      referencedColumnName: 'id',
    },
  })
  Exams: Exams[];

  //user->userexams 테이블 컬럼
  @OneToMany(() => ExamUsers, (examusers) => examusers.User)
  ExamUsers: ExamUsers[];

  // 나의 Exams 컬럼
  @OneToMany(() => Exams, (exams) => exams.Owner)
  OwnedExams: Exams[];
}
