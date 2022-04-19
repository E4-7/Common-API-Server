import { PickType } from '@nestjs/swagger';
import { SignupStudentDTO } from './create-student.dto';

export class FindStudentDto extends PickType(SignupStudentDTO, [
  'name',
  'studentID',
]) {}
