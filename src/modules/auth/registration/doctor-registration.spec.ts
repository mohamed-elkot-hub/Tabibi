import { describe, expect, it, vi } from 'vitest';
import { DoctorReviewStatus, UserRole } from '../../../common/enums';
import { DoctorEmailVerificationHandler } from './doctor-email-verification.handler';
import { DoctorRegistrationService, PENDING_DOCTOR_TTL_MS } from './doctor-registration.service';

describe('DoctorRegistrationService', () => {
  it('stores the pending doctor for three days and sends verification', async () => {
    const cache = { set: vi.fn(), del: vi.fn(), get: vi.fn() };
    const users = { findByEmail: vi.fn().mockResolvedValue(null) };
    const passwords = { hash: vi.fn().mockResolvedValue('hashed-password') };
    const emailVerification = { send: vi.fn().mockResolvedValue({ expiresAt: new Date() }) };
    const storage = { emailTokens: { deleteUserEmailTokens: vi.fn() } };
    const service = new DoctorRegistrationService(cache as never, users as never, passwords as never, emailVerification as never, storage as never);

    const result = await service.register({ name: 'Dr Ada', email: 'ada@example.com', password: 'long-secure-password' });

    expect(result.message).toContain('If registration can be completed');
    expect(cache.set).toHaveBeenCalledWith(expect.stringMatching(/^auth:pending-doctor:/), expect.objectContaining({ email: 'ada@example.com', passwordHash: 'hashed-password' }), PENDING_DOCTOR_TTL_MS);
    expect(PENDING_DOCTOR_TTL_MS).toBe(259_200_000);
    expect(emailVerification.send).toHaveBeenCalledWith(expect.objectContaining({ id: expect.any(String), email: 'ada@example.com' }));
  });

  it('returns the same response without sending mail for an existing email', async () => {
    const cache = { set: vi.fn(), del: vi.fn(), get: vi.fn() };
    const users = { findByEmail: vi.fn().mockResolvedValue({ role: UserRole.DOCTOR }) };
    const passwords = { hash: vi.fn() };
    const emailVerification = { send: vi.fn() };
    const storage = { emailTokens: { deleteUserEmailTokens: vi.fn() } };
    const service = new DoctorRegistrationService(cache as never, users as never, passwords as never, emailVerification as never, storage as never);

    await expect(service.register({ name: 'Dr Ada', email: 'ada@example.com', password: 'long-secure-password' }))
      .resolves.toEqual({ message: 'If registration can be completed, an email verification link has been sent.' });
    expect(cache.set).not.toHaveBeenCalled();
    expect(emailVerification.send).not.toHaveBeenCalled();
  });

  it('removes pending data and the token if delivery fails', async () => {
    const cache = { set: vi.fn(), del: vi.fn(), get: vi.fn() };
    const users = { findByEmail: vi.fn().mockResolvedValue(null) };
    const passwords = { hash: vi.fn().mockResolvedValue('hashed-password') };
    const emailVerification = { send: vi.fn().mockRejectedValue(new Error('mail unavailable')) };
    const storage = { emailTokens: { deleteUserEmailTokens: vi.fn().mockResolvedValue(undefined) } };
    const service = new DoctorRegistrationService(cache as never, users as never, passwords as never, emailVerification as never, storage as never);

    await expect(service.register({ name: 'Dr Ada', email: 'ada@example.com', password: 'long-secure-password' }))
      .rejects.toThrow('mail unavailable');
    expect(cache.del).toHaveBeenCalledWith(expect.stringMatching(/^auth:pending-doctor:/));
    expect(storage.emailTokens.deleteUserEmailTokens).toHaveBeenCalledWith(expect.any(String), 'email-verification');
  });
});

describe('DoctorEmailVerificationHandler', () => {
  it('persists the verified doctor with pending review status and removes Redis data', async () => {
    const pending = { id: '65f000000000000000000001', email: 'ada@example.com', name: 'Dr Ada', passwordHash: 'hashed-password' };
    const cache = { get: vi.fn().mockResolvedValue(pending), del: vi.fn() };
    const doctors = { create: vi.fn().mockResolvedValue(undefined) };
    const users = { findByEmail: vi.fn().mockResolvedValue(null) };
    const mailer = { send: vi.fn() };
    const registry = { registerHandler: vi.fn() };
    const handler = new DoctorEmailVerificationHandler(cache as never, doctors as never, users as never, mailer as never, registry as never);

    await expect(handler.markVerified(pending.id, pending.email)).resolves.toBe(true);
    expect(doctors.create).toHaveBeenCalledWith(expect.objectContaining({
      _id: pending.id,
      email: pending.email,
      role: UserRole.DOCTOR,
      isVerified: true,
      reviewStatus: DoctorReviewStatus.PENDING_ADMIN_REVIEW,
    }));
    expect(cache.del).toHaveBeenCalledWith(`auth:pending-doctor:${pending.id}`);
  });
});
