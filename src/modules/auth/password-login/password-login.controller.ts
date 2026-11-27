import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '@nestjs/authentication';
import { Can } from '@nestjs/authorization';
import { PasswordLoginDto } from './dto/password-login.dto';
import { PasswordLoginService } from './password-login.service';

@Controller('auth')
export class PasswordLoginController {
  constructor(private readonly loginService: PasswordLoginService) {}

  @Post('login')
  @Public()
  @Can.Anyone()
  login(@Body() body: PasswordLoginDto) {
    return this.loginService.login(body);
  }
}
