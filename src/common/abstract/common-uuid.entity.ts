import { PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CommonDateEntity } from './common-date.entity';

export abstract class CommonUUIDEntity extends CommonDateEntity {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: '고유 uuid',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
