import { Body, Controller, Post, Req } from '@nestjs/common';
import { Public, MagicLinkService } from '@nestjs/authentication';
import { Can } from '@nestjs/authorization';
import type { Request } from 'express';
import { RequestDoctorMagicLinkDto } from './dto/request-doctor-magic-link.dto';
import { ConsumeDoctorMagicLinkDto } from './dto/consume-doctor-magic-link.dto';

@Controller('auth/doctor/magic-link')
export class DoctorMagicLinkController {
  constructor(private readonly magicLinks: MagicLinkService) {}

  @Post('request')
  @Public()
  @Can.Anyone()
  async request(@Body() body: RequestDoctorMagicLinkDto) {
    await this.magicLinks.create(body.email);
    return { message: 'If an eligible account exists, a sign-in link has been sent.' };
  }

  @Post('consume')
  @Public()
  @Can.Anyone()
  async consume(@Body() body: ConsumeDoctorMagicLinkDto, @Req() request: Request) {
    const result = await this.magicLinks.consume(body.token, { request });
    if (!result) return { authenticated: false };
    return { authenticated: true, userId: result.session.userId };
  }
}
