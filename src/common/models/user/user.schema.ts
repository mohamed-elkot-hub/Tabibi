import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IUser } from '../../interfaces';
import { UserRole } from '../../enums';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User implements IUser {
  @Prop({
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
  })
  email: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
    select: false,
  })
  password: string;

  @Prop({
    type: String,
  })
  profile?: string;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
  })
  role: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  isVerified?: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
