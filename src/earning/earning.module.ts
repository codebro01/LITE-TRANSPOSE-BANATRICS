import { Module } from '@nestjs/common';
import { EarningService } from './earning.service';
import { EarningController } from './earning.controller';

@Module({
  controllers: [EarningController],
  providers: [EarningService],
})
export class EarningModule {}
