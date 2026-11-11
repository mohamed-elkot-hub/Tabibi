import { AsyncModelFactory } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';

export const userModel: AsyncModelFactory = {
  name: User.name,
  useFactory: () => UserSchema,
};
