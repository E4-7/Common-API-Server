import { Logger, Module } from '@nestjs/common';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exams } from './entities/exam.entity';
import { ExamUsers } from './entities/examusers.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Exams, ExamUsers])],
  controllers: [ExamController],
  providers: [ExamService, Logger],
})
export class ExamModule {}
