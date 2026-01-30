import { Module } from '@nestjs/common';
import { WeeklyProofsService } from './weekly-proofs.service';
import { WeeklyProofsController } from './weekly-proofs.controller';
import { DbModule } from '@src/db/db.module';
import { WeeklyProofsRepository } from '@src/weekly-proofs/repository/weekly-proofs.repository';
import { InstallmentProofsModule } from '@src/installment-proofs/installment-proofs.module';

@Module({
  imports: [DbModule, InstallmentProofsModule],
  controllers: [WeeklyProofsController],
  providers: [WeeklyProofsService, WeeklyProofsRepository],
  exports: [WeeklyProofsService, WeeklyProofsRepository]
})
export class WeeklyProofsModule {}
