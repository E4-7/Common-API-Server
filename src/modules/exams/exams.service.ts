import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  LoggerService,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Exams } from './entities/exam.entity';
import { Connection, Repository } from 'typeorm';
import { ExamUsers } from './entities/examusers.entity';
import {
  CANT_DELETE_MYSELF,
  NEED_AUTHENTIFICATION,
  UNKNOWN_ERR,
} from '../../common/constants/error.constant';
import { FilesService } from '../files/files.service';
import { SignupDto } from '../users/dto/signup-user.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/constants/user-role.enum';

@Injectable()
export class ExamsService {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    @InjectRepository(Exams) private examRepository: Repository<Exams>,
    @InjectRepository(ExamUsers)
    private examUsersRepository: Repository<ExamUsers>,
    private fileService: FilesService,
    private userService: UsersService,
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
      exam.ExamPaper = null;
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

  async findMyExamAll(userId: number) {
    return await this.examUsersRepository
      .createQueryBuilder('ExamUsers')
      .select(['exams', 'ExamUsers.created_at', 'paper'])
      .leftJoin('ExamUsers.Exam', 'exams')
      .leftJoin('exams.ExamPaper', 'paper')
      .where('ExamUsers.UserId = :userId', { userId })
      .getMany();
  }

  async findUserInExam(userId: number, examId: number) {
    return await this.examUsersRepository
      .createQueryBuilder('ExamUsers')
      .select(['users', 'ExamUsers.created_at'])
      .leftJoin('ExamUsers.User', 'users')
      .where('ExamUsers.ExamId = :examId', { examId })
      .andWhere('ExamUsers.Userid != :userId', { userId })
      .getMany();
  }

  async update(userId: number, examId: number, updateExamDto: UpdateExamDto) {
    const exam = await this.examRepository.findOne({
      where: { id: examId },
      relations: ['ExamPaper'],
    });
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

  async uploadPaper(userId: number, examId: number, file: Express.Multer.File) {
    const exam = await this.examRepository.findOne({
      where: { id: examId },
      relations: ['ExamPaper'],
    });
    //examId가 존재 x or 시험이 내 주최가 아님
    if (!exam || exam.OwnerId !== userId) {
      throw new UnauthorizedException(NEED_AUTHENTIFICATION);
    }
    if (exam.ExamPaper) {
      await this.fileService.deleteFile(exam.ExamPaper.key);
    }
    const uploadedFile = await this.fileService.uploadFile(file);
    exam.ExamPaper = uploadedFile;
    const savedExam = await this.examRepository.save(exam);
    return savedExam;
  }

  async createAssistant(
    createAssistantDto: SignupDto,
    examId: number,
    myUserId: number,
  ) {
    const exam = await this.examRepository.findOne({ id: examId });
    if (exam.OwnerId !== myUserId) {
      throw new UnauthorizedException(NEED_AUTHENTIFICATION);
    }

    //TODO: Transaction
    const asssitantUser = await this.userService.join(
      createAssistantDto.email,
      createAssistantDto.name,
      createAssistantDto.password,
      UserRole.ASSISTANT,
    );
    await this.examUsersRepository.save({
      ExamId: examId,
      UserId: asssitantUser.id,
    });
    return asssitantUser;
  }

  async deleteAssistant(
    myUserId: number,
    examId: number,
    assistantUserId: number,
  ) {
    if (myUserId === assistantUserId) {
      throw new UnprocessableEntityException(CANT_DELETE_MYSELF);
    }
    const exam = await this.examRepository.findOne({ id: examId });
    if (exam.OwnerId !== myUserId) {
      throw new UnauthorizedException(NEED_AUTHENTIFICATION);
    }
    const userInExam = await this.examUsersRepository.findOne({
      UserId: assistantUserId,
      ExamId: examId,
    });
    if (!userInExam) {
      throw new UnauthorizedException(NEED_AUTHENTIFICATION);
    }
    await this.userService.delete(assistantUserId);
  }
}
