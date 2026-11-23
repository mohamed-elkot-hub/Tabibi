import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PasswordHasher, SignInService } from '@nestjs/authentication';
import { UserRepository } from '../../../common/models/user';
import { UserRole } from '../../../common/enums';
import { SuperAdminLoginDto } from './dto/super-admin-login.dto';

@Injectable()
export class SuperAdminLoginService {
  constructor(private readonly users: UserRepository, private readonly passwords: PasswordHasher, private readonly signIn: SignInService) {}

  async login(input: SuperAdminLoginDto): Promise<{ user: Record<string, unknown> }> {
    const user = await this.users.findByEmailWithPassword(input.email);
    const validPassword = await this.passwords.verify(input.password, user?.passwordHash);
    if (!user || user.role !== UserRole.SUPER_ADMIN || !user.isVerified || !validPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const session = await this.signIn.signIn(String(user.id), { method: 'password' });
    return { user: { id: String(user.id), name: user.name, email: user.email, role: user.role, sessionExpiresAt: session.session.expiresAt } };
  }
}
