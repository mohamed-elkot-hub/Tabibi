import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PasswordHasher, SignInService } from '@nestjs/authentication';
import { UserRepository } from '../../../common/models/user';
import { UserRole } from '../../../common/enums';
import { PasswordLoginDto } from './dto/password-login.dto';

@Injectable()
export class PasswordLoginService {
  constructor(
    private readonly users: UserRepository,
    private readonly passwords: PasswordHasher,
    private readonly signIn: SignInService,
  ) {}

  async login(input: PasswordLoginDto): Promise<{ user: Record<string, unknown> }> {
    const user = await this.users.findOne({
      filter: { email: input.email },
      projection: '+passwordHash',
    }) as (Awaited<ReturnType<typeof this.users.findOne>> & { _id?: string; passwordHash?: string; reviewStatus?: string }) | null;
    const passwordMatches = await this.passwords.verify(input.password, user?.passwordHash);
    const eligible = user?.isVerified && (
      user.role === UserRole.SUPER_ADMIN ||
      (user.role === UserRole.DOCTOR && user.reviewStatus === 'approved')
    );

    if (!user || !eligible || !passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const session = await this.signIn.signIn(String(user._id), { method: 'password' });
    return {
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        ...(user.role === UserRole.DOCTOR ? { reviewStatus: user.reviewStatus } : {}),
        sessionExpiresAt: session.session.expiresAt,
      },
    };
  }
}
