import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsRepository } from './repositories/students.repository';
import { ExamsRepository } from '../repositories/exams.repository';
import {
  ALREADY_HAS_ID,
  NEED_AUTHENTIFICATION,
} from '../../../common/constants/error.constant';
import { ExamsUsersRepository } from '../repositories/exams-users.repository';
import { FindStudentDto } from './dto/find-student.dto';
import { FilesService } from '../../files/files.service';

@Injectable()
export class StudentsService {
  constructor(
    private readonly studentRepository: StudentsRepository,
    private readonly examRepository: ExamsRepository,
    private readonly examUserRepository: ExamsUsersRepository,
    private fileService: FilesService,
  ) {}

  async create(
    userId: number,
    examId: number,
    createStudentDto: CreateStudentDto,
  ) {
    await this.validateUserExam(userId, examId);
    const students = createStudentDto.students.map((e) => ({
      name: e.name,
      studentID: +e.studentID,
      ExamId: examId,
      AnswerId: null,
      CertificatedImageId: null,
    }));
    try {
      const result = await this.studentRepository.save(students);
      return result;
    } catch (e) {
      throw new InternalServerErrorException(ALREADY_HAS_ID);
    }
  }

  async findAll(userId: number, examId: number) {
    await this.validateUserExam(userId, examId);
    return await this.studentRepository
      .createQueryBuilder('students')
      .select([
        'students.id',
        'students.created_at',
        'students.updated_at',
        'students.ExamId',
        'students.name',
        'students.studentID',
        'students.is_certified',
        'students.lastLogin',
        'students.deleted_at',
        'AnswerId',
        'CertificatedImageId',
      ])
      .leftJoin('students.ExamAnswer', 'AnswerId')
      .leftJoin('students.CertificatedImage', 'CertificatedImageId')
      .where('students.ExamId = :examId', { examId })
      .getMany();
  }

  async isStudentIsAuthentic(examId: number, findStudentDTO: FindStudentDto) {
    const student = this.studentRepository.findOne({
      where: {
        ExamId: examId,
        name: findStudentDTO.name,
        studentID: +findStudentDTO.studentID,
      },
    });
    if (!student) {
      throw new NotFoundException();
    }
  }

  async uploadAnswer(
    examId: number,
    findStudentDTO: FindStudentDto,
    file: Express.Multer.File,
  ) {
    const student = await this.studentRepository.findOne({
      where: { ExamId: examId, studentID: +findStudentDTO.studentID },
      relations: ['ExamAnswer', 'CertificatedImage'],
    });
    if (!student) {
      throw new NotFoundException();
    }
    if (student.ExamAnswer) {
      await this.fileService.deleteFile(student.CertificatedImage.key);
    }
    const uploadedFile = await this.fileService.uploadFile(file);
    student.ExamAnswer = uploadedFile;
    const savedStudent = await this.studentRepository.save(student);
    return savedStudent;
  }

  async uploadSelfAuthenticationImage(
    examId: number,
    findStudentDTO: FindStudentDto,
    file: Express.Multer.File,
  ) {
    const student = await this.studentRepository.findOne({
      where: { ExamId: examId, studentID: +findStudentDTO.studentID },
      relations: ['ExamAnswer', 'CertificatedImage'],
    });
    if (!student) {
      throw new NotFoundException();
    }
    if (student.CertificatedImage) {
      await this.fileService.deleteFile(student.CertificatedImage.key);
    }
    const uploadedFile = await this.fileService.uploadFile(file);
    student.CertificatedImage = uploadedFile;
    const savedStudent = await this.studentRepository.save(student);
    return savedStudent;
  }

  async update(
    userId: number,
    examId: number,
    studentId: number,
    updateStudentDto: UpdateStudentDto,
  ) {
    await this.validateUserExam(userId, examId);
    const student = await this.validateStudentInExam(examId, studentId);
    for (const key in updateStudentDto) {
      student[key] = updateStudentDto[key];
    }
    await this.studentRepository.save(student);
    return student;
  }

  async remove(userId: number, examId: number, studentId: number) {
    await this.validateUserExam(userId, examId);
    await this.validateStudentInExam(examId, studentId);
    await this.studentRepository.softDelete({ id: studentId });
  }

  async validateUserExam(userId: number, examId: number) {
    const examUsers = await this.examUserRepository.find({ ExamId: examId });
    if (!examUsers) {
      throw new UnauthorizedException(NEED_AUTHENTIFICATION);
    }
    const isMember = examUsers.some((e) => e.UserId === userId);
    if (!isMember) {
      throw new UnauthorizedException(NEED_AUTHENTIFICATION);
    }
  }

  async validateStudentInExam(examId: number, studentId: number) {
    const student = await this.studentRepository.findOne({ id: studentId });
    if (!student || student.ExamId !== examId) {
      throw new UnauthorizedException(NEED_AUTHENTIFICATION);
    }
    return student;
  }
}
