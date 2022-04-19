import { PartialType } from '@nestjs/swagger';
import { SignupStudentDTO } from './create-student.dto';

export class UpdateStudentDto extends PartialType(SignupStudentDTO) {}
