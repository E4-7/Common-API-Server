import { Logger, Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exams } from './entities/exam.entity';
import { ExamUsers } from './entities/examusers.entity';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [TypeOrmModule.forFeature([Exams, ExamUsers]), FilesModule],
  controllers: [ExamsController],
  providers: [ExamsService, Logger],
})
export class ExamsModule {}
