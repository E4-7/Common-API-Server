import { OmitType } from '@nestjs/swagger';
import { Users } from '../entities/user.entity';

export class NoPasswordUserDto extends OmitType(Users, ['password']) {}
