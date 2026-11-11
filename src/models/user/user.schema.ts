import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export enum Role {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN'
}

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, discriminatorKey: 'role' })
export class User {
  @Prop({ required: true, trim: true, maxlength: 80 })
  name: string

  @Prop({ required: true, unique: true, lowercase: true, trim: true, maxlength: 120 })
  email: string

  @Prop({ required: true, select: false })
  password: string

  @Prop({ trim: true })
  phone?: string

  @Prop({ type: String, enum: Role, required: true })
  role: Role
}

export const UserSchema = SchemaFactory.createForClass(User);