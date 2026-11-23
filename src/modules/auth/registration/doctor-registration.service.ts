import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import {
  EmailVerificationService,
  PasswordHasher,
} from '@nestjs/authentication';
import { AuthenticationStorage } from '@nestjs/authentication';
import { Types } from 'mongoose';
import { UserRepository } from '../../../common/models/user';
import { RegisterDoctorDto } from './dto/register-doctor.dto';

export const PENDING_DOCTOR_TTL_MS = 3 * 24 * 60 * 60 * 1000;
const pendingDoctorKey = (id: string) => `auth:pending-doctor:${id}`;

export interface PendingDoctorRegistration {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
}

@Injectable()
export class DoctorRegistrationService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly users: UserRepository,
    private readonly passwords: PasswordHasher,
    private readonly emailVerification: EmailVerificationService,
    private readonly storage: AuthenticationStorage,
  ) {}

  async register(input: RegisterDoctorDto): Promise<{ message: string }> {
    const existing = await this.users.findByEmail(input.email);
    if (existing) return this.registrationResponse();

    const id = new Types.ObjectId().toHexString();
    const pending: PendingDoctorRegistration = {
      id,
      email: input.email,
      name: input.name,
      passwordHash: await this.passwords.hash(input.password),
    };

    await this.cache.set(pendingDoctorKey(id), pending, PENDING_DOCTOR_TTL_MS);
    try {
      await this.emailVerification.send({ id, email: input.email });
    } catch (error) {
      await Promise.all([
        this.cache.del(pendingDoctorKey(id)),
        this.storage.emailTokens.deleteUserEmailTokens(
          id,
          'email-verification',
        ),
      ]);
      throw error;
    }

    return this.registrationResponse();
  }

  private registrationResponse(): { message: string } {
    return {
      message:
        'If registration can be completed, an email verification link has been sent.',
    };
  }
}
