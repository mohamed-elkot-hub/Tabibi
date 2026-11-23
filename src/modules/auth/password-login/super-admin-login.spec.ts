import { describe, expect, it, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../../../common/enums';
import { SuperAdminLoginService } from './super-admin-login.service';

describe('SuperAdminLoginService', () => {
  it('signs in a verified super-admin with valid credentials', async () => {
    const account = { id: 'admin-1', name: 'Admin', email: 'admin@example.com', role: UserRole.SUPER_ADMIN, isVerified: true, passwordHash: 'hash' };
    const users = { findByEmailWithPassword: vi.fn().mockResolvedValue(account) };
    const passwords = { verify: vi.fn().mockResolvedValue(true) };
    const signIn = { signIn: vi.fn().mockResolvedValue({ session: { expiresAt: new Date('2026-01-01') } }) };
    const service = new SuperAdminLoginService(users as never, passwords as never, signIn as never);

    await expect(service.login({ email: account.email, password: 'secret' } as never)).resolves.toMatchObject({ user: { id: account.id, role: UserRole.SUPER_ADMIN } });
    expect(signIn.signIn).toHaveBeenCalledWith(account.id, { method: 'password' });
  });

  it.each([
    [null, true],
    [{ role: UserRole.DOCTOR, isVerified: true, passwordHash: 'hash' }, true],
    [{ role: UserRole.SUPER_ADMIN, isVerified: false, passwordHash: 'hash' }, true],
    [{ role: UserRole.SUPER_ADMIN, isVerified: true, passwordHash: 'hash' }, false],
  ])('rejects invalid admin credentials', async (account, validPassword) => {
    const service = new SuperAdminLoginService(
      { findByEmailWithPassword: vi.fn().mockResolvedValue(account) } as never,
      { verify: vi.fn().mockResolvedValue(validPassword) } as never,
      { signIn: vi.fn() } as never,
    );
    await expect(service.login({ email: 'admin@example.com', password: 'secret' } as never)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
