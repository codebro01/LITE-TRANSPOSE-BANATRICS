import { Module } from '@nestjs/common';
import { InstallmentProofsService } from './installment-proofs.service';
import { InstallmentProofsController } from './installment-proofs.controller';
import { InstallmentProofRepository } from '@src/installment-proofs/repository/installment-proofs.repository';
import { CampaignModule } from '@src/campaign/campaign.module';

@Module({
  imports: [CampaignModule], 
  controllers: [InstallmentProofsController],
  providers: [InstallmentProofsService, InstallmentProofRepository],
  exports: [InstallmentProofsService, InstallmentProofRepository],
})
export class InstallmentProofsModule {}
