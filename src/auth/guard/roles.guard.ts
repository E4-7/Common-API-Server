import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import {
  NEED_AUTHENTIFICATION,
  NEED_LOGIN,
} from '../../common/constants/constant';
import { Reflector } from '@nestjs/core';

const matchRoles = (roles: number[], userRoles: number) => {
  const result = roles.some((role) => role === userRoles);
  return result;
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<number[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // 만약 Endpoint에 대한 Role이 없을 경우
    if (!requiredRoles) return true;

    // Role이 있으면 Authentification이 필요한 것으로 가정
    // 따라 logged-in.guard.ts파일 삭제
    const request = context.switchToHttp().getRequest();
    if (!request.isAuthenticated()) throw new ForbiddenException(NEED_LOGIN);

    const user = request.user;
    const result = matchRoles(requiredRoles, +user.Role.type);
    if (!result) {
      throw new ForbiddenException(NEED_AUTHENTIFICATION);
    } else return result;
  }
}
