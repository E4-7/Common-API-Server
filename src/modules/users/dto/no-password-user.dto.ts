import { OmitType } from '@nestjs/swagger';
import { Users } from '../entities/users.entity';

export class NoPasswordUserDto extends OmitType(Users, ['password']) {}
