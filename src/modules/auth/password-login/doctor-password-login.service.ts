import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PasswordHasher, SignInService } from '@nestjs/authentication';
import { UserRepository } from '../../../common/models/user';
import { UserRole } from '../../../common/enums';
import { DoctorPasswordLoginDto } from './dto/doctor-password-login.dto';

@Injectable()
export class DoctorPasswordLoginService {
  constructor(
    private readonly users: UserRepository,
    private readonly passwords: PasswordHasher,
    private readonly signIn: SignInService,
  ) {}

  async login(input: DoctorPasswordLoginDto): Promise<{ user: Record<string, unknown> }> {
    const user = await this.users.findByEmailWithPassword(input.email);
    const passwordMatches = await this.passwords.verify(input.password, user?.passwordHash);

    if (!user || user.role !== UserRole.DOCTOR || !user.isVerified || !passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const session = await this.signIn.signIn(String(user.id), { method: 'password' });
    return {
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        reviewStatus: user.reviewStatus,
        sessionExpiresAt: session.session.expiresAt,
      },
    };
  }
}
