import { Column, Entity, OneToOne } from 'typeorm';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Exams } from '../../exams/entities/exams.entity';
import { Students } from '../../exams/students/entities/student.entity';
import { CommonIdEntity } from '../../../common/abstract/common-id.entity';

@Entity()
export class Files extends CommonIdEntity {
  @IsString()
  @IsNotEmpty()
  @Column({ unique: true })
  @ApiProperty({
    example: 'dkasfwn22',
    description: '파일 키(삭제 시, 중요)',
  })
  key: string;

  @IsNumber()
  @IsNotEmpty()
  @Column()
  @ApiProperty({
    example: '2325151',
    description: '파일 크기',
  })
  size: number;

  @IsString()
  @IsNotEmpty()
  @Column()
  @ApiProperty({
    example: 'text/plain',
    description: '파일 종류',
  })
  mimetype: string;

  @IsString()
  @IsNotEmpty()
  @Column()
  @ApiProperty({
    example: '직박구리',
    description: '파일 이름',
  })
  original_name: string;

  @IsString()
  @IsNotEmpty()
  @Column()
  @ApiProperty({
    example: 'https://~~',
    description: '파일 url',
  })
  url: string;

  //시험지 -> 시험
  @OneToOne(() => Exams, (exams) => exams.ExamPaper)
  Exam: Exams;

  //답안지 -> 학생
  @OneToOne(() => Students, (students) => students.ExamAnswer)
  Student: Students;
  //인증사진 -> 학생
  @OneToOne(() => Students, (students) => students.CertificatedImage)
  StudentImage: Students;
}
