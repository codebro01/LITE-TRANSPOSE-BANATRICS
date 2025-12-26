import { Module } from '@nestjs/common';
import { BankDetailsService } from './bank-details.service';
import { BankDetailsController } from './bank-details.controller';
import { DbModule } from '@src/db/db.module';
import { BankDetailsRepository } from '@src/bank-details/repository/bank-details-repository';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [DbModule, HttpModule],
  controllers: [BankDetailsController],
  providers: [BankDetailsService, BankDetailsRepository],
  exports: [BankDetailsService, BankDetailsRepository],
})
export class BankDetailsModule {}
