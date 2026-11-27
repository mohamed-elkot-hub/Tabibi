import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import {
  AuthenticationRegistry,
  EmailVerificationHandler,
} from '@nestjs/authentication';
import type { EmailVerificationLink } from '@nestjs/authentication';
import { Mailer } from '@nestjs/mail';
import { DoctorEmailVerificationMail } from '../../../common/mail/doctor-email-verification.mail';
import { DoctorRepository } from '../../../common/models/doctor';
import { UserRepository } from '../../../common/models/user';
import { UserRole, DoctorReviewStatus } from '../../../common/enums';
import { PendingDoctorRegistration } from './doctor-registration.service';

const pendingDoctorKey = (id: string) => `auth:pending-doctor:${id}`;

@Injectable()
export class DoctorEmailVerificationHandler extends EmailVerificationHandler {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly doctors: DoctorRepository,
    private readonly users: UserRepository,
    private readonly mailer: Mailer,
    registry: AuthenticationRegistry,
  ) {
    super();
    registry.registerHandler('emailVerification', this);
  }

  async send(link: EmailVerificationLink): Promise<void> {
    await this.mailer.send(DoctorEmailVerificationMail, {
      to: link.email,
      data: { url: link.url, expiresAt: link.expiresAt },
    });
  }

  async markVerified(userId: string, email: string): Promise<boolean> {
    const key = pendingDoctorKey(userId);
    const pending = await this.cache.get<PendingDoctorRegistration>(key);
    if (!pending || pending.id !== userId || pending.email !== email)
      return false;

    const existing = await this.users.findOne({ filter: { email } });
    if (existing) {
      if (
        existing.role === UserRole.DOCTOR &&
        existing.isVerified &&
        String(existing._id) === userId
      ) {
        await this.cache.del(key);
        return true;
      }
      return false;
    }

    await this.doctors.create({
      _id: userId,
      email: pending.email,
      name: pending.name,
      passwordHash: pending.passwordHash,
      role: UserRole.DOCTOR,
      isVerified: true,
      reviewStatus: DoctorReviewStatus.PENDING_ADMIN_REVIEW,
    });
    await this.cache.del(key);
    return true;
  }
}
