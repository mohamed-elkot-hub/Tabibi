import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../../modules';
import { IS_PUBLIC } from '../decorators/public.decorator';
import { Reflector } from '@nestjs/core';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly userService: UserService, private readonly reflector: Reflector) {}

  async canActivate(context:ExecutionContext): Promise<boolean> {
  const request = context.switchToHttp().getRequest();
    const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
  const userId= request.session?.userId;

  if (!userId){
    throw new UnauthorizedException('please login');
  }
  request.user =await this.userService.findById(userId)

  return true;
  }
}