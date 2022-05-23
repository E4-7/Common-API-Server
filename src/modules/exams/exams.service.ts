import {
  Inject,
  Injectable,
  Logger,
  LoggerService,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { ExamUsers } from './entities/exams-users.entity';
import {
  CANT_DELETE_MYSELF,
  NEED_AUTHENTIFICATION,
} from '../../common/constants/error.constant';
import { FilesService } from '../files/files.service';
import { ExamsRepository } from './repositories/exams.repository';
import { ExamsUsersRepository } from './repositories/exams-users.repository';
import { SignupDto } from '../users/dto/signup-user.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/constants/user-role.enum';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { ConfigService } from '@nestjs/config';
import { RtcRole, RtcTokenBuilder } from 'agora-access-token';
import { v4 as uuidv4 } from 'uuid';
import { ExamStatusDto } from './dto/exam-status.dto';

@Injectable()
export class ExamsService {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    private readonly examsRepository: ExamsRepository,
    private readonly examsUsersRepository: ExamsUsersRepository,
    private fileService: FilesService,
    private userService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Transactional()
  async create(createExamDto: CreateExamDto, userId: string) {
    const exam = this.examsRepository.create();
    exam.id = uuidv4();
    exam.OwnerId = userId;
    exam.exam_time = createExamDto.exam_time;
    exam.is_openbook = createExamDto.is_openbook;
    exam.name = createExamDto.name;
    exam.ExamPaper = null;
    const agoraAppId = this.configService.get('agora.appId');
    const agoraToken = this.generateAgoraToken(exam.id, agoraAppId);
    exam.agoraAppId = agoraAppId;
    exam.agoraToken = agoraToken;
    await this.examsRepository.save(exam);
    const examUser = this.examsUsersRepository.create();
    examUser.UserId = userId;
    examUser.ExamId = exam.id;
    await this.examsUsersRepository.save(examUser);
    return exam;
  }

  generateAgoraToken(channel: string, appId: string) {
    const appCertificate = this.configService.get('agora.authentic_key');
    const role = RtcRole.PUBLISHER;
    const HOUR_TO_SECOND = 3600;
    const expirationTimeInSeconds = HOUR_TO_SECOND * 24;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
    return RtcTokenBuilder.buildTokenWithUid(
      appId ?? '',
      appCertificate ?? '',
      channel ?? '',
      0,
      role,
      privilegeExpiredTs,
    );
  }

  async findMyExamAll(userId: string) {
    return await this.examsUsersRepository
      .createQueryBuilder('ExamUsers')
      .select(['exams', 'ExamUsers.created_at', 'paper'])
      .leftJoin('ExamUsers.Exam', 'exams')
      .leftJoin('exams.ExamPaper', 'paper')
      .where('ExamUsers.UserId = :userId', { userId })
      .getMany();
  }

  async findExamOne(userId: string, examId: string) {
    return await this.examsUsersRepository
      .createQueryBuilder('ExamUsers')
      .select(['exams', 'ExamUsers.created_at', 'paper'])
      .leftJoin('ExamUsers.Exam', 'exams')
      .leftJoin('exams.ExamPaper', 'paper')
      .where('ExamUsers.UserId = :userId', { userId })
      .where('ExamUsers.ExamId = :examId', { examId })
      .getOne();
  }

  async findUserInExam(userId: string, examId: string) {
    return await this.examsUsersRepository
      .createQueryBuilder('ExamUsers')
      .select(['users', 'ExamUsers.created_at'])
      .leftJoin('ExamUsers.User', 'users')
      .where('ExamUsers.ExamId = :examId', { examId })
      .andWhere('ExamUsers.Userid != :userId', { userId })
      .getMany();
  }

  async update(userId: string, examId: string, updateExamDto: UpdateExamDto) {
    const exam = await this.examsRepository.findOne({
      where: { id: examId },
      relations: ['ExamPaper'],
    });
    if (!exam || exam.OwnerId !== userId) {
      throw new UnauthorizedException(NEED_AUTHENTIFICATION);
    }
    for (const key in updateExamDto) {
      exam[key] = updateExamDto[key];
    }
    await this.examsRepository.save(exam);
    return exam;
  }

  async delete(userId: string, examId: string) {
    //사용자 인증 본인의 시험만 삭제 가능
    const exam = await this.examsRepository.findOne({ id: examId });
    if (!exam || exam.OwnerId !== userId) {
      throw new UnauthorizedException(NEED_AUTHENTIFICATION);
    }
    await this.examsRepository.delete({ id: examId });
  }

  @Transactional()
  async uploadPaper(userId: string, examId: string, file: Express.Multer.File) {
    const exam = await this.examsRepository.findOne({
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
    const savedExam = await this.examsRepository.save(exam);
    // TODO: driver에 따른 file service 분기 -> rollback시 aws 파일 delete 로직 추가
    return savedExam;
  }

  @Transactional()
  async createAssistant(
    createAssistantDto: SignupDto,
    examId: string,
    myUserId: string,
  ) {
    const exam = await this.examsRepository.findOne({ id: examId });
    if (exam.OwnerId !== myUserId) {
      throw new UnauthorizedException(NEED_AUTHENTIFICATION);
    }

    const assitantUser = await this.userService.join(
      createAssistantDto.email,
      createAssistantDto.name,
      createAssistantDto.password,
      UserRole.ASSISTANT,
    );
    const { password, ...excludePasswordAssistantUser } = assitantUser;
    await this.examsUsersRepository.save({
      ExamId: examId,
      UserId: assitantUser.id,
    });
    return excludePasswordAssistantUser;
  }

  async deleteAssistant(
    myUserId: string,
    examId: string,
    assistantUserId: string,
  ) {
    if (myUserId === assistantUserId) {
      throw new UnprocessableEntityException(CANT_DELETE_MYSELF);
    }
    const exam = await this.examsRepository.findOne({ id: examId });
    if (!exam || exam.OwnerId !== myUserId) {
      throw new UnauthorizedException(NEED_AUTHENTIFICATION);
    }
    const userInExam = await this.examsUsersRepository.findOne({
      UserId: assistantUserId,
      ExamId: examId,
    });
    if (!userInExam) {
      throw new UnauthorizedException(NEED_AUTHENTIFICATION);
    }
    await this.userService.delete(assistantUserId);
  }
}
