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
} from '@nestjs/common';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateColumn } from './dto/update-exam.dto';
import { UserRole } from '../users/constants/user-role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { User } from '../../common/decorators/user.decorator';
import { Users } from '../users/entities/user.entity';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Exams } from './entities/exam.entity';
import { myExamDto } from './dto/my-exam.dto';

@ApiTags('EXAMS')
@Controller('api/exams')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

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
  @ApiOperation({ summary: '내가 만든 시험 데이터 가져오기' })
  @ApiOkResponse({
    description: '성공',
    type: myExamDto,
    isArray: true,
  })
  @Roles(UserRole.PROFESSOR, UserRole.ASSISTANT)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(@User() user: Users) {
    return await this.examService.findAll(user.id);
  }

  /* @UseGuards(LocalAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examService.findOne(+id);
  }*/

  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '시험 데이터 수정하기' })
  @ApiOkResponse({
    description: '성공',
    type: Exams,
  })
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.PROFESSOR)
  @Patch(':id')
  async update(
    @User() user: Users,
    @Param('id') id: string,
    @Body() updateExamDto: UpdateColumn,
  ) {
    return await this.examService.update(user.id, +id, updateExamDto);
  }

  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '시험 데이터 삭제하기' })
  @ApiNoContentResponse({
    description: '성공',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.PROFESSOR)
  @Delete(':id')
  async delete(@User() user: Users, @Param('id') id: string) {
    await this.examService.delete(user.id, +id);
  }
}
