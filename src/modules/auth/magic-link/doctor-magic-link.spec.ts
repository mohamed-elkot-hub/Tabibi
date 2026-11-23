import { describe, expect, it, vi } from 'vitest';
import { UserRole } from '../../../common/enums';
import { DoctorMagicLinkHandler } from './doctor-magic-link.handler';

describe('DoctorMagicLinkHandler', () => {
  it('registers the handler and sends the configured mailable', async () => {
    const users = { findByEmail: vi.fn() };
    const mailer = { send: vi.fn() };
    const registry = { registerHandler: vi.fn() };
    const handler = new DoctorMagicLinkHandler(users as never, mailer as never, registry as never);
    const link = { email: 'doctor@example.com', url: 'https://tabibi.test/sign-in?token=x', expiresAt: new Date('2026-01-01T00:00:00.000Z') };

    expect(registry.registerHandler).toHaveBeenCalledWith('magicLink', handler);
    await handler.send(link);
    expect(mailer.send).toHaveBeenCalledWith(expect.any(Function), { to: link.email, data: { url: link.url, expiresAt: link.expiresAt } });
  });

  it.each([
    [{ role: UserRole.DOCTOR, isVerified: true }, true],
    [{ role: UserRole.SUPER_ADMIN, isVerified: true }, true],
    [{ role: UserRole.DOCTOR, isVerified: false }, false],
    [{ role: UserRole.PATIENT, isVerified: true }, false],
    [null, false],
  ])('resolves only verified doctor/admin accounts', async (account, allowed) => {
    const handler = new DoctorMagicLinkHandler(
      { findByEmail: vi.fn().mockResolvedValue(account && { ...account, id: 'user-1', email: 'doctor@example.com' }) } as never,
      { send: vi.fn() } as never,
      { registerHandler: vi.fn() } as never,
    );

    const result = await handler.resolveUser('doctor@example.com');
    expect(Boolean(result)).toBe(allowed);
    if (allowed) expect(result).toEqual({ id: 'user-1', email: 'doctor@example.com' });
  });
});
