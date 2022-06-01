import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExamStatus } from '../contants/exam-status.enum';
import { Users } from '../../users/entities/users.entity';
import { ExamUsers } from './exams-users.entity';
import { Files } from '../../files/entities/files.entity';
import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { Students } from '../students/entities/student.entity';
import { CommonUUIDEntity } from '../../../common/abstract/common-uuid.entity';

@Index('OwnerId', ['OwnerId'])
@Entity()
export class Exams extends CommonUUIDEntity {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '운영체제 3반',
    description: '시험 과목 명',
  })
  @Column('varchar', { name: 'name', length: 50, nullable: false })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'appID',
    description: 'agora sdk appID',
  })
  @Column('varchar', { name: 'agoraAppId', length: 200, nullable: false })
  agoraAppId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'token ',
    description: 'agora sdk token',
  })
  @Column('varchar', { name: 'agoraToken', length: 200, nullable: false })
  agoraToken: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    example: '2021-07-17T14:30:00+09:00',
    description: '시험 시간',
  })
  @Column({
    type: 'timestamp',
    name: 'exam_time',
    nullable: false,
  })
  exam_time: Date;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    example: true,
    description: '오픈 북 여부',
  })
  @Column({
    type: 'boolean',
    name: 'is_openbook',
    nullable: false,
    default: false,
  })
  is_openbook: boolean;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @IsEnum(ExamStatus)
  @IsNotEmpty()
  @ApiProperty({
    example: ExamStatus.BEFORE,
    description: '시험 상태(진행전, 진행중, 끝)',
  })
  @Column('enum', {
    name: 'status',
    enum: ExamStatus,
    default: ExamStatus.BEFORE,
  })
  status: ExamStatus;

  //UserId
  @ManyToMany(() => Users, (users) => users.Exams)
  Users: Users[];

  @OneToMany(() => ExamUsers, (examusers) => examusers.Exam, {
    cascade: ['insert'],
  })
  ExamUsers: ExamUsers[];
  //owner
  @Column('varchar', { name: 'OwnerId', nullable: true, length: 200 })
  OwnerId: string | null;

  @ManyToOne(() => Users, (users) => users.Exams, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'OwnerId', referencedColumnName: 'id' }])
  Owner: Users;

  @ApiModelProperty({ type: Files })
  @OneToOne(() => Files, (files) => files.Exam, {
    onDelete: 'SET NULL',
  })
  @JoinColumn([{ name: 'PaperId', referencedColumnName: 'id' }])
  ExamPaper: Files;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'answer url',
    description: 'answer file url',
  })
  @Column('varchar', { name: 'AnswerUrl', length: 250, nullable: true })
  AnswerUrl: string;

  //시험 <-> 학생
  @OneToMany(() => Students, (students) => students.Exam)
  Students: Students[];
}
