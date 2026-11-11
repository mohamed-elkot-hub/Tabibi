import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, User, UserSchema } from '../../models/user/user.schema.js';
import { Doctor, DoctorSchema } from '../../models/doctor/doctor.schema.js';
import { UserRepository } from '../../models/user/user.repository.js';
import { DoctorRepository } from '../../models/doctor/doctor.repository.js';
import { UserService } from './user.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
        discriminators: [
          { name: Doctor.name, schema: DoctorSchema, value: Role.DOCTOR },
        ]
      }
    ])
  ],
  providers: [UserService, UserRepository, DoctorRepository],
  exports: [UserService],
})
export class UserModule {}