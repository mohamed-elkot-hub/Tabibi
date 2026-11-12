import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

import type { Request } from 'express';
import type { IUser } from '../../common';

type AuthRequest = Request & {
  user?: IUser;
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Get required roles
    const roles = this.reflector.getAllAndOverride<IUser['role'][]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. No roles required
    if (!roles || roles.length === 0) {
      return true;
    }

    // 3. Get current request
    const request = context.switchToHttp().getRequest<AuthRequest>();

    // 4. Get authenticated user
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Please login first');
    }

    // 5. Check user role
    const hasRole = roles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException('You do not have permission');
    }

    return true;
  }
}
