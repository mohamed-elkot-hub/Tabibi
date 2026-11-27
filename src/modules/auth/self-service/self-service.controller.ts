import { Body, Controller, Get, Patch } from '@nestjs/common';
import { Authenticate, CurrentUser } from '@nestjs/authentication';
import type { AuthUser } from '../shared/auth-user';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SelfService } from './self-service.service';

@Controller('auth/me')
@Authenticate()
export class SelfServiceController {
  constructor(private readonly self: SelfService) {}

  @Get()
  getProfile(@CurrentUser() user: AuthUser) {
    return this.self.getProfile(user.id);
  }

  @Patch()
  updateProfile(@CurrentUser() user: AuthUser, @Body() body: UpdateProfileDto) {
    return this.self.updateProfile(user.id, body);
  }

  @Patch('password')
  changePassword(@CurrentUser() user: AuthUser, @Body() body: ChangePasswordDto) {
    return this.self.changePassword(user.id, body);
  }
}
