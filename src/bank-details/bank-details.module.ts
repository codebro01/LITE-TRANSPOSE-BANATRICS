import { Module } from '@nestjs/common';
import { BankDetailsService } from './bank-details.service';
import { BankDetailsController } from './bank-details.controller';
import { DbModule } from '@src/db/db.module';
import { BankDetailsRepository } from '@src/bank-details/repository/create-bank-details-repository';

@Module({
  imports:[DbModule,], 
  controllers: [BankDetailsController],
  providers: [BankDetailsService, BankDetailsRepository],
  exports : [BankDetailsService, BankDetailsRepository]
})
export class BankDetailsModule {}
