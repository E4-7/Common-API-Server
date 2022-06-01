import { Logger, Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesModule } from '../files/files.module';

import { ExamsRepository } from './repositories/exams.repository';
import { ExamsUsersRepository } from './repositories/exams-users.repository';
import { UsersModule } from '../users/users.module';
import { StudentsModule } from './students/students.module';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { StudentsRepository } from './students/repositories/students.repository';

@Module({
  imports: [
    HttpModule.register({
      timeout: 20000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([
      ExamsRepository,
      ExamsUsersRepository,
      StudentsRepository,
    ]),
    FilesModule,
    UsersModule,
    StudentsModule,
  ],
  controllers: [ExamsController],
  providers: [ExamsService, Logger, ConfigService],
  exports: [StudentsModule],
})
export class ExamsModule {}
