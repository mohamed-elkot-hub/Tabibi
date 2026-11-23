import { Module } from '@nestjs/common';
import { DoctorMagicLinkController } from './doctor-magic-link.controller';
import { DoctorMagicLinkHandler } from './doctor-magic-link.handler';
import { AuthMailModule } from '../shared/auth-mail.module';

@Module({
  imports: [AuthMailModule],
  controllers: [DoctorMagicLinkController],
  providers: [DoctorMagicLinkHandler],
})
export class MagicLinkModule {}
