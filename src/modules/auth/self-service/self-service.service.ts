import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PasswordHasher, SessionService } from '@nestjs/authentication';
import { UserRepository } from '../../../common/models/user';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class SelfService {
  constructor(
    private readonly users: UserRepository,
    private readonly passwords: PasswordHasher,
    private readonly sessions: SessionService,
  ) {}

  async getProfile(id: string) {
    const user = await this.users.findOne({ filter: { _id: id } });
    if (!user) throw new NotFoundException('Account not found');
    return this.toProfile({ ...user, id: String(user._id) });
  }

  async updateProfile(id: string, input: UpdateProfileDto) {
    const user = await this.users.findOneAndUpdate({
      filter: { _id: id },
      update: { $set: { name: input.name.trim() } },
      options: { new: true, runValidators: true, projection: '-passwordHash' },
    });
    if (!user) throw new NotFoundException('Account not found');
    return this.toProfile({ ...user, id: String(user._id) });
  }

  async changePassword(id: string, input: ChangePasswordDto): Promise<{ success: true }> {
    const user = await this.users.findOne({
      filter: { _id: id },
      projection: '+passwordHash',
    }) as (Awaited<ReturnType<typeof this.users.findOne>> & { passwordHash?: string }) | null;
    if (!user || !(await this.passwords.verify(input.currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    if (input.currentPassword === input.newPassword) {
      throw new UnauthorizedException('New password must differ from current password');
    }
    const passwordHash = await this.passwords.hash(input.newPassword);
    const updated = await this.users.updateOne({ _id: id }, { $set: { passwordHash } });
    if (!updated) throw new NotFoundException('Account not found');
    await this.sessions.revokeAll(id);
    return { success: true };
  }

  private toProfile(user: { id: string; name: string; email: string; role: string; isVerified?: boolean; profile?: string; reviewStatus?: string }) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      ...(user.profile ? { profile: user.profile } : {}),
      ...(user.reviewStatus ? { reviewStatus: user.reviewStatus } : {}),
    };
  }
}
