import { Logger, Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesModule } from '../files/files.module';

import { ExamsRepository } from './repositories/exams.repository';
import { ExamsUsersRepository } from './repositories/exams-users.repository';
import { UsersModule } from '../users/users.module';
import { StudentsModule } from './students/students.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExamsRepository, ExamsUsersRepository]),
    FilesModule,
    UsersModule,
    StudentsModule,
  ],
  controllers: [ExamsController],
  providers: [ExamsService, Logger],
  exports: [StudentsModule],
})
export class ExamsModule {}
