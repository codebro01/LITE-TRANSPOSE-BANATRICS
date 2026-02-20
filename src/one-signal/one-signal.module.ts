import { Module } from '@nestjs/common';
import { OneSignalService } from './one-signal.service';
import { OneSignalController } from './one-signal.controller';

@Module({
  controllers: [OneSignalController],
  providers: [OneSignalService],
  exports: [OneSignalService],
})
export class OneSignalModule {}
