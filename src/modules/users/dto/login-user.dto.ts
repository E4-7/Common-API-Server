import { PickType } from '@nestjs/swagger';
import { Users } from '../entities/users.entity';

export class LoginUserDto extends PickType(Users, [
  'email',
  'password',
] as const) {}
