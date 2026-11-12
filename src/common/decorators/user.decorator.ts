import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { Request } from 'express';
import type { IUser } from '../../common';

type AuthenticatedRequest = Request & {
  user?: IUser;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): IUser | undefined => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

    return request.user;
  },
);
