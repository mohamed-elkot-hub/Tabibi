import { Module } from '@nestjs/common';
import { AuthMailModule } from '../shared/auth-mail.module';
import { DoctorRegistrationController } from './doctor-registration.controller';
import { DoctorRegistrationService } from './doctor-registration.service';
import { DoctorEmailVerificationHandler } from './doctor-email-verification.handler';

@Module({
  imports: [AuthMailModule],
  controllers: [DoctorRegistrationController],
  providers: [DoctorRegistrationService, DoctorEmailVerificationHandler],
})
export class RegistrationModule {}
