import { Module } from '@nestjs/common';
import { DoctorPasswordLoginController } from './doctor-password-login.controller';
import { DoctorPasswordLoginService } from './doctor-password-login.service';
import { DoctorSessionProvider } from './doctor-session.provider';
import { SuperAdminLoginController } from './super-admin-login.controller';
import { SuperAdminLoginService } from './super-admin-login.service';

@Module({
  controllers: [DoctorPasswordLoginController, SuperAdminLoginController],
  providers: [DoctorPasswordLoginService, SuperAdminLoginService, DoctorSessionProvider],
  exports: [DoctorPasswordLoginService],
})
export class DoctorPasswordLoginModule {}
