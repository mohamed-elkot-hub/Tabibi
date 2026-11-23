import { Module } from '@nestjs/common';
import { SelfServiceController } from './self-service.controller';
import { SelfService } from './self-service.service';

@Module({
  controllers: [SelfServiceController],
  providers: [SelfService],
})
export class SelfServiceModule {}
