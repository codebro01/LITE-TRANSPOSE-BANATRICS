import { Module } from '@nestjs/common';
import { EarningService } from './earning.service';
import { EarningController } from './earning.controller';
import { DbModule } from '@src/db/db.module'
import { HttpModule } from '@nestjs/axios';
import { EarningRepository } from '@src/earning/repository/earning.repository';
import { BankDetailsModule } from '@src/bank-details/bank-details.module';

@Module({
  imports: [DbModule, HttpModule, BankDetailsModule], 
  controllers: [EarningController],
  providers: [EarningService, EarningRepository],
  exports: [EarningService, EarningRepository]
})
export class EarningModule {}
