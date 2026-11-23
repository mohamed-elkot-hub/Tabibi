import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '@nestjs/authentication';
import { Can } from '@nestjs/authorization';
import { DoctorPasswordLoginDto } from './dto/doctor-password-login.dto';
import { DoctorPasswordLoginService } from './doctor-password-login.service';

@Controller('auth/doctor')
export class DoctorPasswordLoginController {
  constructor(private readonly loginService: DoctorPasswordLoginService) {}

  @Post('password-login')
  @Public()
  @Can.Anyone()
  login(@Body() body: DoctorPasswordLoginDto) {
    return this.loginService.login(body);
  }
}
