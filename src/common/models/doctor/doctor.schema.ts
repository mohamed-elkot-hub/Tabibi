import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DoctorReviewStatus } from '../../enums';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  discriminatorKey: 'role',
})
export class Doctor {
  @Prop({
    type: String,
    enum: Object.values(DoctorReviewStatus),
    default: DoctorReviewStatus.PENDING_ADMIN_REVIEW,
    required: true,
  })
  reviewStatus: DoctorReviewStatus;

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop({ type: String })
  approvedBy?: string;
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);
