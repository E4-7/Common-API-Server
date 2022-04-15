import { PickType } from '@nestjs/swagger';
import { Users } from '../entities/users.entity';

export class SignupUserDto extends PickType(Users, [
  'email',
  'password',
  'name',
] as const) {}
