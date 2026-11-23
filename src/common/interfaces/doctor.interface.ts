import { IUser } from './user.interface';
import { DoctorReviewStatus } from '../enums';

export interface IDoctor extends IUser {
  reviewStatus: DoctorReviewStatus;
  approvedAt?: Date;
  approvedBy?: string;
}
