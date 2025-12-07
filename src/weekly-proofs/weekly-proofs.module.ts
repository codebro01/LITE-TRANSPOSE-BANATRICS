import { Module } from '@nestjs/common';
import { WeeklyProofsService } from './weekly-proofs.service';
import { WeeklyProofsController } from './weekly-proofs.controller';
import { DbModule } from '@src/db/db.module';
import { WeeklyProofsRepository } from '@src/weekly-proofs/repository/weekly-proofs.repository';
@Module({
  imports: [DbModule],
  controllers: [WeeklyProofsController],
  providers: [WeeklyProofsService, WeeklyProofsRepository],
  exports: [WeeklyProofsService, WeeklyProofsRepository]
})
export class WeeklyProofsModule {}
