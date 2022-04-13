import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  LoggerService,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Exams } from './entities/exam.entity';
import { Connection, Repository } from 'typeorm';
import { ExamUsers } from './entities/examusers.entity';
import {
  NEED_AUTHENTIFICATION,
  UNKNOWN_ERR,
} from '../../common/constants/error.constant';

@Injectable()
export class ExamService {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    @InjectRepository(Exams) private examRepository: Repository<Exams>,
    @InjectRepository(ExamUsers)
    private examUsersRepository: Repository<ExamUsers>,
    private connection: Connection,
  ) {}

  async create(createExamDto: CreateExamDto, userId: number) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const exam = await queryRunner.manager.getRepository(Exams).create();
      exam.OwnerId = userId;
      exam.exam_time = createExamDto.exam_time;
      exam.is_openbook = createExamDto.is_openbook;
      exam.name = createExamDto.name;
      await queryRunner.manager.getRepository(Exams).save(exam);
      const examMember = queryRunner.manager.getRepository(ExamUsers).create();
      examMember.UserId = userId;
      examMember.ExamId = exam.id;
      await queryRunner.manager.getRepository(ExamUsers).save(examMember);
      await queryRunner.commitTransaction();
      return exam;
    } catch (error) {
      this.logger.error(error);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(UNKNOWN_ERR);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(userId: number) {
    return await this.examUsersRepository
      .createQueryBuilder('ExamUsers')
      .select(['exam', 'ExamUsers.createdAt'])
      .leftJoin('ExamUsers.Exam', 'exam')
      .where('ExamUsers.UserId = :userId', { userId })
      .getMany();
  }

  async update(userId: number, examId: number, updateExamDto: UpdateExamDto) {
    const exam = await this.examRepository.findOne({ id: +examId });
    if (!exam || exam.OwnerId !== userId) {
      throw new UnauthorizedException(NEED_AUTHENTIFICATION);
    }
    for (const key in updateExamDto) {
      exam[key] = updateExamDto[key];
    }
    await this.examRepository.save(exam);
    return exam;
  }

  async delete(userId: number, examId: number) {
    //사용자 인증 본인의 시험만 삭제 가능
    const exam = await this.examRepository.findOne({ id: +examId });
    if (!exam || exam.OwnerId !== userId) {
      throw new UnauthorizedException(NEED_AUTHENTIFICATION);
    }
    await this.examRepository.delete({ id: +examId });
  }
}
