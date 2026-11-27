import { Body, Controller, Post } from '@nestjs/common';
import { Can } from '@nestjs/authorization';
import { EmailVerificationService, Public } from '@nestjs/authentication';
import { DoctorRegistrationService } from './doctor-registration.service';
import { RegisterDoctorDto } from './dto/register-doctor.dto';
import { VerifyDoctorEmailDto } from './dto/verify-doctor-email.dto';

@Controller('auth/doctor')
export class DoctorRegistrationController {
  constructor(
    private readonly registration: DoctorRegistrationService,
    private readonly emailVerification: EmailVerificationService,
  ) {}

  @Post('register')
  @Public()
  @Can.Anyone()
  register(@Body() body: RegisterDoctorDto) {
    return this.registration.register(body);
  }

  @Post('verify-email')
  @Public()
  @Can.Anyone()
  async verifyEmail(@Body() body: VerifyDoctorEmailDto) {
    const verified = await this.emailVerification.verify(body.token);
    if (!verified) return { verified: false };
    return {
      verified: true,
      userId: verified.userId,
      status: 'pending_admin_review',
    };
  }
}
