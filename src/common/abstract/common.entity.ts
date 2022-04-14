import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsDate, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export abstract class CommonEntity {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: '1',
    description: '고유 id',
  })
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

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
