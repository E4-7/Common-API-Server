import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsRepository } from './repositories/students.repository';
import { ExamsRepository } from '../repositories/exams.repository';
import { ExamsUsersRepository } from '../repositories/exams-users.repository';
import { FilesModule } from '../../files/files.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 12000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([
      StudentsRepository,
      ExamsRepository,
      ExamsUsersRepository,
    ]),
    FilesModule,
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
