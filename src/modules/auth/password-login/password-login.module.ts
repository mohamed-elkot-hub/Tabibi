import { Module } from '@nestjs/common';
import { PasswordLoginController } from './password-login.controller';
import { PasswordLoginService } from './password-login.service';
import { DoctorSessionProvider } from './doctor-session.provider';

@Module({
  controllers: [PasswordLoginController],
  providers: [PasswordLoginService, DoctorSessionProvider],
  exports: [PasswordLoginService],
})
export class PasswordLoginModule {}
