import { PickType } from '@nestjs/swagger';
import { Exams } from '../entities/exams.entity';

export class CreateExamDto extends PickType(Exams, [
  'name',
  'exam_time',
  'is_openbook',
] as const) {}
