import { Controller, Get, Param, Patch } from '@nestjs/common';
import { Authenticate, CurrentUser } from '@nestjs/authentication';
import { Can } from '@nestjs/authorization';
import type { AuthUser } from '../../auth/shared/auth-user';
import { DoctorReviewPolicy } from './doctor-review.policy';
import { DoctorReviewService } from './doctor-review.service';

@Controller('admin/doctors')
@Authenticate()
@Can(DoctorReviewPolicy, 'canReview')
export class DoctorReviewController {
  constructor(private readonly reviews: DoctorReviewService) {}

  @Get('pending')
  pending() {
    return this.reviews.pending();
  }

  @Patch(':doctorId/approve')
  approve(@Param('doctorId') doctorId: string, @CurrentUser() user: AuthUser) {
    return this.reviews.approve(doctorId, user.id);
  }
}
