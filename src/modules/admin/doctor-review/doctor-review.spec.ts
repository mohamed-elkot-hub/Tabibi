import { describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { DoctorReviewPolicy } from './doctor-review.policy';
import { DoctorReviewService } from './doctor-review.service';
import { UserRole } from '../../../common/enums';

describe('DoctorReviewPolicy', () => {
  const policy = new DoctorReviewPolicy();
  it('allows only super-admin users', () => {
    expect(policy.canReview({ role: UserRole.SUPER_ADMIN } as never)).toBe(true);
    expect(policy.canReview({ role: UserRole.DOCTOR } as never)).toBe(false);
    expect(policy.canReview(null)).toBe(false);
  });
});

describe('DoctorReviewService', () => {
  it('lists pending doctors and records approval', async () => {
    const pending = [{ id: 'doctor-1' }];
    const users = { findPendingDoctors: vi.fn().mockResolvedValue(pending), approveDoctor: vi.fn().mockResolvedValue({ ...pending[0], reviewStatus: 'approved' }) };
    const service = new DoctorReviewService(users as never);
    await expect(service.pending()).resolves.toEqual(pending);
    await expect(service.approve('65f000000000000000000001', 'admin-1')).resolves.toMatchObject({ reviewStatus: 'approved' });
    expect(users.approveDoctor).toHaveBeenCalledWith('65f000000000000000000001', 'admin-1');
  });

  it('rejects malformed and non-pending doctor IDs', async () => {
    const service = new DoctorReviewService({ approveDoctor: vi.fn().mockResolvedValue(null) } as never);
    await expect(service.approve('bad-id', 'admin-1')).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.approve('65f000000000000000000001', 'admin-1')).rejects.toBeInstanceOf(NotFoundException);
  });
});
