import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { UserRepository } from '../../../common/models/user';

@Injectable()
export class DoctorReviewService {
  constructor(private readonly users: UserRepository) {}

  async pending() {
    return this.users.findPendingDoctors();
  }

  async approve(doctorId: string, adminId: string) {
    if (!Types.ObjectId.isValid(doctorId)) throw new NotFoundException('Doctor not found');
    const doctor = await this.users.approveDoctor(doctorId, adminId);
    if (!doctor) throw new NotFoundException('Verified doctor awaiting review was not found');
    return doctor;
  }
}
