import { Injectable } from '@nestjs/common';
import { AuthenticationRegistry, SessionCookieProvider, type SessionRecord} from '@nestjs/authentication';
import { type PublicUser, toPublicUser } from './auth.mapper.js'
import { UserService } from '../user/user.service.js';

@Injectable()
export class SessionAuth extends SessionCookieProvider<PublicUser> {
  constructor(
    private readonly users: UserService,
    registry: AuthenticationRegistry,
  ){
    super();
    registry.registerProvider(this)
   }

  async validate(session: SessionRecord) {
    const user = await this.users.findById(session.userId)
    return user ? toPublicUser(user) : null
  }
}