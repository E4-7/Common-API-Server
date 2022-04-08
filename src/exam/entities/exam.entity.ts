import { CommonEntity } from '../../common/abstract/common.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExamStatus } from '../contants/exam-status.enum';
import { Users } from '../../users/entities/user.entity';

@Entity()
export class Exam extends CommonEntity {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '운영체제 3반',
    description: '시험 과목 명',
  })
  @Column('varchar', { name: 'name', length: 50, nullable: false })
  name: string;

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
  deletedAt: Date | null;

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
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: '1',
    description: '유저 id',
  })
  @ManyToOne(() => Users, (user) => user.id, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn([{ name: 'UserId', referencedColumnName: 'id' }])
  User: Users;
  //시험지id
}
