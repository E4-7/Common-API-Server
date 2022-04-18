import { Logger, Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesModule } from '../files/files.module';
import { ExamsRepository } from './repositories/exams.repository';
import { ExamsUsersRepository } from './repositories/exams-users.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExamsRepository, ExamsUsersRepository]),
    FilesModule,
  ],
  controllers: [ExamsController],
  providers: [ExamsService, Logger],
})
export class ExamsModule {}
