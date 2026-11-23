import { describe, expect, it, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../../../common/enums';
import { DoctorPasswordLoginService } from './doctor-password-login.service';

describe('DoctorPasswordLoginService', () => {
  const doctor = { id: 'doctor-1', name: 'Dr Ada', email: 'ada@example.com', role: UserRole.DOCTOR, isVerified: true, reviewStatus: 'approved', passwordHash: 'hash' };

  it('verifies credentials and creates a password session', async () => {
    const users = { findByEmailWithPassword: vi.fn().mockResolvedValue(doctor) };
    const passwords = { verify: vi.fn().mockResolvedValue(true) };
    const signIn = { signIn: vi.fn().mockResolvedValue({ session: { expiresAt: new Date('2026-01-01T00:00:00Z') } }) };
    const service = new DoctorPasswordLoginService(users as never, passwords as never, signIn as never);

    await expect(service.login({ email: doctor.email, password: 'secret' } as never)).resolves.toMatchObject({ user: { id: doctor.id, email: doctor.email, role: UserRole.DOCTOR } });
    expect(passwords.verify).toHaveBeenCalledWith('secret', doctor.passwordHash);
    expect(signIn.signIn).toHaveBeenCalledWith(doctor.id, { method: 'password' });
  });

  it.each([
    [null, true],
    [{ ...doctor, role: UserRole.SUPER_ADMIN }, true],
    [{ ...doctor, isVerified: false }, true],
    [doctor, false],
  ])('rejects invalid login accounts/passwords', async (account, passwordMatches) => {
    const service = new DoctorPasswordLoginService(
      { findByEmailWithPassword: vi.fn().mockResolvedValue(account) } as never,
      { verify: vi.fn().mockResolvedValue(passwordMatches) } as never,
      { signIn: vi.fn() } as never,
    );
    await expect(service.login({ email: 'ada@example.com', password: 'secret' } as never)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
