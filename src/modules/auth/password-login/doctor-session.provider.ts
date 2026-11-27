import { Injectable } from '@nestjs/common';
import { AuthenticationRegistry, SessionCookieProvider } from '@nestjs/authentication';
import type { SessionRecord } from '@nestjs/authentication';
import { UserRepository } from '../../../common/models/user';
import { AuthUser } from '../shared/auth-user';

@Injectable()
export class DoctorSessionProvider extends SessionCookieProvider<AuthUser> {
  constructor(users: UserRepository, registry: AuthenticationRegistry) {
    super();
    this.users = users;
    registry.registerProvider(this);
  }

  private readonly users: UserRepository;

  protected async validate(session: SessionRecord): Promise<AuthUser | null> {
    const user = await this.users.findOne({ filter: { _id: session.userId } });
    if (!user || !user.isVerified) return null;
    return user as AuthUser;
  }
}
