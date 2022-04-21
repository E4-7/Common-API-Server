import { PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CommonDateEntity } from './common-date.entity';

export abstract class CommonIdEntity extends CommonDateEntity {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: '1',
    description: '고유 id',
  })
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;
}
