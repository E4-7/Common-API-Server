import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/constants/user-role.enum';
import { Users } from '../../users/entities/users.entity';
import { User } from '../../../common/decorators/user.decorator';
import { Students } from './entities/student.entity';
import { FindStudentDto } from './dto/find-student.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  FileSize,
  Mimetype,
} from '../../../common/constants/file-info.constant';
import { ParsePdfPipe } from '../../../common/pipes/parse-pdf.pipe';
import { ParseImagePipe } from '../../../common/pipes/parse-image.pipe';

@ApiTags('STUDENTS')
@Controller('api/exams/:examId/students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '엑셀을 통한 수험자 데이터 생성' })
  @ApiCreatedResponse({
    description: '성공',
    type: Students,
    isArray: true,
  })
  @Roles(UserRole.PROFESSOR, UserRole.ASSISTANT)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Param('examId') examId: string,
    @Body() createStudentDto: CreateStudentDto,
    @User() user: Users,
  ) {
    return await this.studentsService.create(user.id, examId, createStudentDto);
  }

  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '생성된 모든 학생 가져오기' })
  @ApiOkResponse({
    description: '성공',
    type: Students,
    isArray: true,
  })
  @Roles(UserRole.PROFESSOR, UserRole.ASSISTANT)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(@Param('examId') examId: string, @User() user: Users) {
    return await this.studentsService.findAll(user.id, examId);
  }

  @ApiOperation({ summary: '답안 업로드' })
  @ApiOkResponse({
    description: '성공',
  })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes(Mimetype.MULTITYPE_FORM_DATA)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('upload/answer')
  async uploadAnswer(
    @Param('examId') examId: string,
    @Body() findStudentDTO: FindStudentDto,
    @UploadedFile(new ParsePdfPipe(FileSize._10MB)) file: Express.Multer.File,
  ) {
    return await this.studentsService.uploadAnswer(
      examId,
      findStudentDTO,
      file,
    );
  }

  @ApiOperation({ summary: '학생증 인증하기' })
  @ApiOkResponse({
    description: '성공',
    type: Students,
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes(Mimetype.MULTITYPE_FORM_DATA)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('authentication')
  async checkSelfAuthentication(
    @Param('examId') examId: string,
    @Body() findStudentDTO: FindStudentDto,
    @UploadedFile(new ParseImagePipe(FileSize._10MB)) file: Express.Multer.File,
  ) {
    return await this.studentsService.checkSelfAuthentication(
      examId,
      findStudentDTO,
      file,
    );
  }

  @ApiOperation({ summary: '인증된 학생증 및 신분증 사진 업로드' })
  @ApiOkResponse({
    description: '성공',
    type: Students,
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes(Mimetype.MULTITYPE_FORM_DATA)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('authentication/image')
  async uploadSelfAuthenticationImage(
    @Param('examId') examId: string,
    @Body() findStudentDTO: FindStudentDto,
    @UploadedFile(new ParseImagePipe(FileSize._10MB)) file: Express.Multer.File,
  ) {
    return await this.studentsService.uploadSelfAuthenticationImage(
      examId,
      findStudentDTO,
      file,
    );
  }

  @ApiOperation({ summary: '학생의 정보 유효한지 확인' })
  @ApiNoContentResponse({
    description: '성공',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('authentic')
  async isStudentIsAuthentic(
    @Param('examId') examId: string,
    @Body() findStudentDTO: FindStudentDto,
  ) {
    return await this.studentsService.isStudentIsAuthentic(
      examId,
      findStudentDTO,
    );
  }

  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '학생 정보 변경하기' })
  @ApiOkResponse({
    description: '성공',
    type: Students,
  })
  @Roles(UserRole.PROFESSOR, UserRole.ASSISTANT)
  @HttpCode(HttpStatus.OK)
  @Patch(':studentId')
  async update(
    @Param('examId') examId: string,
    @Param('studentId') studentId: string,
    @User() user: Users,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return await this.studentsService.update(
      user.id,
      examId,
      studentId,
      updateStudentDto,
    );
  }

  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '학생 정보 삭제하기' })
  @ApiNoContentResponse({
    description: '성공',
  })
  @Roles(UserRole.PROFESSOR, UserRole.ASSISTANT)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':studentId')
  remove(
    @Param('examId') examId: string,
    @Param('studentId') studentId: string,
    @User() user: Users,
  ) {
    return this.studentsService.remove(user.id, examId, studentId);
  }
}
