import { AsyncModelFactory } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { Doctor, DoctorSchema } from '../doctor';

export const userModel: AsyncModelFactory = {
  name: User.name,
  useFactory: () => UserSchema,
  discriminators: [{ name: Doctor.name, schema: DoctorSchema }],
};
