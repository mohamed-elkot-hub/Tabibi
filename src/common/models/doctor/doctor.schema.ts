import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IDoctor, IUser } from '../../interfaces';
import { UserRole } from '../../enums';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  discriminatorKey: 'role',
})
export class Doctor {}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);
