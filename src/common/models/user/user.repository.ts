import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUser } from '../../interfaces';
import { AbstractRepository } from '../abstract.repository';
import { User } from './user.schema';
import { Injectable } from '@nestjs/common';
import { DoctorReviewStatus } from '../../enums';

export interface AuthUserRecord extends IUser {
  _id: string;
  id: string;
  passwordHash?: string;
  reviewStatus?: string;
}

@Injectable()
export class UserRepository extends AbstractRepository<IUser> {
  constructor(
    @InjectModel(User.name) protected readonly userModel: Model<IUser>,
  ) {
    super(userModel);
  }

  async findByEmailWithPassword(email: string): Promise<AuthUserRecord | null> {
    return this.userModel.findOne({ email }).select('+passwordHash').lean({ virtuals: true }).exec() as Promise<AuthUserRecord | null>;
  }

  async findById(id: string): Promise<AuthUserRecord | null> {
    return this.userModel.findOne({ _id: id }).lean({ virtuals: true }).exec() as Promise<AuthUserRecord | null>;
  }

  async findByEmail(email: string): Promise<AuthUserRecord | null> {
    return this.userModel.findOne({ email }).lean({ virtuals: true }).exec() as Promise<AuthUserRecord | null>;
  }

  async approveDoctor(id: string, adminId: string): Promise<AuthUserRecord | null> {
    return this.userModel.findOneAndUpdate(
      { _id: id, role: 'doctor', isVerified: true, reviewStatus: DoctorReviewStatus.PENDING_ADMIN_REVIEW },
      { $set: { reviewStatus: DoctorReviewStatus.APPROVED, approvedAt: new Date(), approvedBy: adminId } },
      { new: true },
    ).select('-passwordHash').lean().exec() as Promise<AuthUserRecord | null>;
  }

  async findPendingDoctors(): Promise<IUser[]> {
    return this.userModel.find({ role: 'doctor', isVerified: true, reviewStatus: DoctorReviewStatus.PENDING_ADMIN_REVIEW }).select('-passwordHash').lean().exec() as Promise<IUser[]>;
  }
}
