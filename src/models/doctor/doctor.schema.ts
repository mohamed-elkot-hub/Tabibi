import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { User } from '../user/user.schema.js';

export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

@Schema()
export class Doctor {

  @Prop({ required: true, trim: true, maxlength: 80 })
  specialty: string

  @Prop({ required: true, trim: true, unique: true, sparse: true })
  licenseNumber: string

  @Prop({ trim: true, maxlength: 120 })
  clinicName?: string

  @Prop({ trim: true, maxlength: 200 })
  clinicAddress?: string

  @Prop({ min: 0 })
  consultationFee?: number

  @Prop({ min: 5, max: 240, default: 30 })
  slotDurationMinutes: number

  @Prop({ type: String, enum: VerificationStatus, default: VerificationStatus.PENDING})
  verificationStatus: VerificationStatus
}

export type DoctorDocument = HydratedDocument<User & Doctor>
export const DoctorSchema = SchemaFactory.createForClass(Doctor)