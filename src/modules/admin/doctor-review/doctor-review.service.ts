import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { UserRepository } from '../../../common/models/user';
import { DoctorReviewStatus } from '../../../common/enums';

@Injectable()
export class DoctorReviewService {
  constructor(private readonly users: UserRepository) {}

  async pending() {
    return this.users.find({
      filter: { role: 'doctor', isVerified: true, reviewStatus: DoctorReviewStatus.PENDING_ADMIN_REVIEW },
      projection: '-passwordHash',
    });
  }

  async approve(doctorId: string, adminId: string) {
    if (!Types.ObjectId.isValid(doctorId)) throw new NotFoundException('Doctor not found');
    const doctor = await this.users.findOneAndUpdate({
      filter: { _id: doctorId, role: 'doctor', isVerified: true, reviewStatus: DoctorReviewStatus.PENDING_ADMIN_REVIEW },
      update: { $set: { reviewStatus: DoctorReviewStatus.APPROVED, approvedAt: new Date(), approvedBy: adminId } },
      options: { new: true, projection: '-passwordHash' },
    });
    if (!doctor) throw new NotFoundException('Verified doctor awaiting review was not found');
    return doctor;
  }
}
