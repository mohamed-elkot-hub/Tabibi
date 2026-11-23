import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '@nestjs/authentication';
import { Can } from '@nestjs/authorization';
import { SuperAdminLoginDto } from './dto/super-admin-login.dto';
import { SuperAdminLoginService } from './super-admin-login.service';

@Controller('auth/super-admin')
export class SuperAdminLoginController {
  constructor(private readonly loginService: SuperAdminLoginService) {}

  @Post('password-login')
  @Public()
  @Can.Anyone()
  login(@Body() body: SuperAdminLoginDto) {
    return this.loginService.login(body);
  }
}
