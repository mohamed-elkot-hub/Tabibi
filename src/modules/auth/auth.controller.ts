import { Body, Controller, HttpCode, Post, UnauthorizedException } from '@nestjs/common';
import { ApiConflictResponse, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse} from '@nestjs/swagger';
import { Public, SignInService } from '@nestjs/authentication';
import { AuthService } from './auth.service.js';
import { RegisterDoctorDto } from './dto/register-doctor.dto.js';
import { LoginDto } from './dto/login.dto.js';


@ApiTags('Auth')
@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly signInService: SignInService,
  ) {}

  @ApiOperation({ summary: 'Register a doctor (PENDING until admin approval)' })
  @ApiResponse({ status: 201, description: 'Doctor created (no password or license number returned)' })
  @ApiConflictResponse({ description: 'Email or license number already registered' })
  @Post('register/doctor')
  registerDoctor(@Body() dto: RegisterDoctorDto) {
    return this.auth.registerDoctor(dto);
  }

  @ApiOperation({ summary: 'Log in with email and password (sets the session cookie)' })
  @ApiResponse({ status: 200, description: 'Logged in, session cookie set' })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    const user = await this.auth.validateCredentials(dto);
    await this.signInService.signIn(user.id, { method: 'password' });
    return user;
  }

  @ApiOperation({ summary: 'Log out (ends the session and clears the cookie)' })
  @ApiCookieAuth('session')
  @ApiResponse({ status: 200, description: 'Logged out' })
  @ApiUnauthorizedResponse({ description: 'Not signed in' })
  @Post('logout')
  @HttpCode(200)
  async logout() {
    if (!(await this.signInService.signOut())) {
      throw new UnauthorizedException('Not signed in');
    }
    return { message: 'Logged out' };
  }
}