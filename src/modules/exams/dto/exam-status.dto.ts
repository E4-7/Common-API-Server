import { PickType } from '@nestjs/swagger';
import { Exams } from '../entities/exams.entity';

export class ExamStatusDto extends PickType(Exams, ['status'] as const) {}
