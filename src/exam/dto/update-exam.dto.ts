import { PartialType } from '@nestjs/mapped-types';
import { Exams } from '../entities/exam.entity';
import { PickType } from '@nestjs/swagger';

export class UpdateColumn extends PickType(Exams, [
  'name',
  'exam_time',
  'is_openbook',
  'status',
] as const) {}

export class UpdateExamDto extends PartialType(UpdateColumn) {}
