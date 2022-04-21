import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupStudentDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '김도군',
    description: '학생 이름',
  })
  name: string;

  @IsNotEmpty()
  @ApiProperty({
    example: '12345567',
    description: '학번',
  })
  studentID: number | string;
}

export class CreateStudentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @IsNotEmpty()
  @ApiProperty({
    example: '[{name:"조찬민",studentId:"17011604"}]',
    description: '학생 목록 리스트',
  })
  students: Array<SignupStudentDTO>;
}
