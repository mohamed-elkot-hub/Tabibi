import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule, MongoDBModule } from './modules';
import { AppConfigModule } from './config/app.config';
import { AuthModule } from './modules/auth/auth.module';
import { DoctorReviewModule } from './modules/admin/doctor-review/doctor-review.module';

@Module({
  imports: [
    { module: MongoDBModule, global: true },
    AppConfigModule,
    UserModule,
    AuthModule,
    DoctorReviewModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
