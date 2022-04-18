import { PickType } from '@nestjs/swagger';
import { Users } from '../entities/users.entity';

export class SignupDto extends PickType(Users, [
  'email',
  'password',
  'name',
] as const) {}
