import { Module } from '@nestjs/common';
import { DoctorReviewController } from './doctor-review.controller';
import { DoctorReviewService } from './doctor-review.service';
import { DoctorReviewPolicy } from './doctor-review.policy';

@Module({
  controllers: [DoctorReviewController],
  providers: [DoctorReviewService, DoctorReviewPolicy],
})
export class DoctorReviewModule {}
