import { Module } from '@nestjs/common';
import { WeeklyProofsService } from './weekly-proofs.service';
import { WeeklyProofsController } from './weekly-proofs.controller';
import { DbModule } from '@src/db/db.module';
import { WeeklyProofsRepository } from '@src/weekly-proofs/repository/weekly-proofs.repository';
import { InstallmentProofsModule } from '@src/installment-proofs/installment-proofs.module';
import { UserModule } from '@src/users/users.module';
import { NotificationModule } from '@src/notification/notification.module';
import { CampaignModule } from '@src/campaign/campaign.module';

@Module({
  imports: [DbModule, InstallmentProofsModule, UserModule, NotificationModule, CampaignModule],
  controllers: [WeeklyProofsController],
  providers: [WeeklyProofsService, WeeklyProofsRepository],
  exports: [WeeklyProofsService, WeeklyProofsRepository]
})
export class WeeklyProofsModule {}
