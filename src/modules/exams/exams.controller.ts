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
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { UserRole } from '../users/constants/user-role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { User } from '../../common/decorators/user.decorator';
import { Users } from '../users/entities/users.entity';
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
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSize, Mimetype } from '../../common/constants/file-info.constant';
import { ParsePdfPipe } from '../../common/pipes/parse-pdf.pipe';
import { UsersService } from '../users/users.service';
import { SignupDto } from '../users/dto/signup-user.dto';
import { NoPasswordUserDto } from '../users/dto/no-password-user.dto';
import { UserInExamDto } from './dto/user-in-exam.dto';
import { MyExamDto } from './dto/my-exam.dto';
import { Exams } from './entities/exams.entity';
import { ParseImagePipe } from '../../common/pipes/parse-image.pipe';

@ApiTags('EXAMS')
@Controller('api/exams')
export class ExamsController {
  constructor(
    private readonly examService: ExamsService,
    private readonly userService: UsersService,
  ) {}

  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '내가 만든 시험 데이터 가져오기' })
  @ApiOkResponse({
    description: '성공',
    type: MyExamDto,
    isArray: true,
  })
  @Roles(UserRole.PROFESSOR, UserRole.ASSISTANT)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findMyExamAll(@User() user: Users) {
    return await this.examService.findMyExamAll(user.id);
  }

  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '시험 만들기' })
  @ApiCreatedResponse({
    description: '성공',
    type: Exams,
  })
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.PROFESSOR)
  @Post()
  async create(@User() user: Users, @Body() createExamDto: CreateExamDto) {
    return await this.examService.create(createExamDto, user.id);
  }

  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '한 개의 시험 정보 가져오기' })
  @ApiOkResponse({
    description: '성공',
    type: MyExamDto,
  })
  @Roles(UserRole.PROFESSOR, UserRole.ASSISTANT)
  @HttpCode(HttpStatus.OK)
  @Get(':examId')
  async findExamOne(@User() user: Users, @Param('examId') examId: string) {
    return await this.examService.findExamOne(user.id, examId);
  }

  @ApiOperation({ summary: '시험 데이터 수정하기' })
  @ApiOkResponse({
    description: '성공',
    type: Exams,
  })
  @HttpCode(HttpStatus.OK)
  @Patch(':examId')
  async update(
    @Param('examId') examId: string,
    @Body() updateExamDto: UpdateExamDto,
  ) {
    return await this.examService.update(examId, updateExamDto);
  }

  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '시험 데이터 삭제하기' })
  @ApiNoContentResponse({
    description: '성공',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.PROFESSOR)
  @Delete(':examId')
  async delete(@User() user: Users, @Param('examId') examId: string) {
    await this.examService.delete(user.id, examId);
  }

  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '시험지 업로드' })
  @ApiOkResponse({
    description: '성공',
    type: Exams,
  })
  @Roles(UserRole.PROFESSOR)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
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
  @Post(':examId/upload')
  async uploadPaper(
    @UploadedFile(new ParsePdfPipe(FileSize._10MB)) file: Express.Multer.File,
    @User() user: Users,
    @Param('examId') examId: string,
  ) {
    return await this.examService.uploadPaper(user.id, examId, file);
  }

  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '정답 업로드 및 자동 채점' })
  @ApiOkResponse({
    description: '성공',
    type: Exams,
  })
  @Roles(UserRole.PROFESSOR)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
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
  @Post(':examId/uploadAnswer')
  async uploadAnswerAndScore(
    @UploadedFile(new ParseImagePipe(FileSize._10MB)) file: Express.Multer.File,
    @User() user: Users,
    @Param('examId') examId: string,
  ) {
    return await this.examService.uploadAnswerAndScore(user.id, examId, file);
  }

  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '시험에 속한 조교 조회하기' })
  @ApiOkResponse({
    description: '성공',
    type: UserInExamDto,
    isArray: true,
  })
  @Roles(UserRole.PROFESSOR, UserRole.ASSISTANT)
  @HttpCode(HttpStatus.OK)
  @Get(':examId/assistant')
  async findUserInExam(@User() user: Users, @Param('examId') examId: string) {
    return await this.examService.findUserInExam(user.id, examId);
  }

  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '조교 추가하기' })
  @ApiCreatedResponse({
    description: '성공',
    type: NoPasswordUserDto,
  })
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.PROFESSOR)
  @Post(':examId/assistant')
  async createAssistant(
    @User() user: Users,
    @Body() createAssistantDto: SignupDto,
    @Param('examId') examId: string,
  ) {
    return await this.examService.createAssistant(
      createAssistantDto,
      examId,
      user.id,
    );
  }

  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '조교 삭제' })
  @ApiNoContentResponse({
    description: '성공',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.PROFESSOR)
  @Delete(':examId/assistant/:assistantId')
  async deleteAssistant(
    @User() user: Users,
    @Param('examId') examId: string,
    @Param('assistantId') assistantUserId: string,
  ) {
    await this.examService.deleteAssistant(user.id, examId, assistantUserId);
  }
}
