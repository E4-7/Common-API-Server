import { PartialType } from '@nestjs/swagger';
import { Users } from '../entities/user.entity';

export class UpdateUserDto extends PartialType(Users) {}
