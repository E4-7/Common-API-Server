import { ApiProperty } from '@nestjs/swagger';
import { Users } from '../../users/entities/users.entity';

export class UserInExamDto {
  @ApiProperty({
    example:
      '2021-07-17T14:30:00+09:00[시험 만든(참가) 날짜 or 조교 가입 날짜(권한에 따라 달라짐)]',
    description: '시험 만든 날짜 or 조교 가입 날짜(권한에 따라 달라짐)',
  })
  created_at: Date;

  @ApiProperty({ type: () => Users })
  User: Users;
}
