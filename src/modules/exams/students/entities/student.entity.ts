import { CommonEntity } from '../../../../common/abstract/common.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { Files } from '../../../files/entities/files.entity';
import { Exams } from '../../entities/exams.entity';

@Entity()
@Index(['studentID', 'ExamId'])
export class Students extends CommonEntity {
  //시험 ID
  @ManyToOne(() => Exams, (exams) => exams.Students, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'ExamId', referencedColumnName: 'id' }])
  Exam: Exams;

  @Column('int', { name: 'ExamId', nullable: true })
  ExamId: number | null;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '김두필',
    description: '학생이름',
  })
  @Column('varchar', { name: 'name', length: 20, nullable: false })
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: '17011604',
    description: '학번',
  })
  @Column({ name: 'studentID', length: 15, nullable: false })
  studentID: number;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    example: true,
    description: '인증여부',
  })
  @Column({
    type: 'boolean',
    name: 'is_certified',
    nullable: false,
    default: false,
  })
  is_certified: boolean;

  @IsDate()
  @ApiProperty({
    example: '2021-07-17T14:30:00+09:00',
    description: '마지막 로그인',
  })
  @Column({ nullable: true })
  lastLogin: Date;

  //답안지
  @ApiModelProperty({ type: Files })
  @OneToOne(() => Files, (files) => files.Student, {
    onDelete: 'SET NULL',
  })
  @JoinColumn([{ name: 'AnswerId', referencedColumnName: 'id' }])
  ExamAnswer: Files;

  //인증 사진
  @ApiModelProperty({ type: Files })
  @OneToOne(() => Files, (files) => files.StudentImage, {
    onDelete: 'SET NULL',
  })
  @JoinColumn([{ name: 'CertificatedImageId', referencedColumnName: 'id' }])
  CertificatedImage: Files;

  @DeleteDateColumn()
  deleted_at: Date;
}
