import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsDate, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export abstract class CommonDateEntity {
  @IsDate()
  @IsNotEmpty()
  @ApiProperty({
    example: '2022-04-04 20:17:54.032942',
    description: '생성일시',
  })
  @CreateDateColumn()
  created_at: Date;

  @IsDate()
  @IsNotEmpty()
  @ApiProperty({
    example: '2022-04-04 20:17:54.032942',
    description: '수정일시',
  })
  @UpdateDateColumn()
  updated_at: Date;
}
