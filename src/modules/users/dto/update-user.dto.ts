import { PartialType } from '@nestjs/swagger';
import { Users } from '../entities/users.entity';

export class UpdateUserDto extends PartialType(Users) {}
