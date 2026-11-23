import type { IUser } from '../../../common/interfaces';

export interface AuthUser extends Omit<IUser, '_id' | 'passwordHash'> {
  _id: string;
  id: string;
  role: string;
  isVerified: boolean;
  reviewStatus?: string;
}

declare module '@nestjs/authentication' {
  interface AuthenticationTypes {
    user: AuthUser;
  }
}
