import { forwardRef, Module } from '@nestjs/common';
import { InstallmentProofsService } from './installment-proofs.service';
import { InstallmentProofsController } from './installment-proofs.controller';
import { InstallmentProofRepository } from '@src/installment-proofs/repository/installment-proofs.repository';
import { CampaignModule } from '@src/campaign/campaign.module';
import { UserModule } from '@src/users/users.module';
import { NotificationModule } from '@src/notification/notification.module';

@Module({
  imports: [forwardRef(() => CampaignModule), UserModule, NotificationModule],
  controllers: [InstallmentProofsController],
  providers: [InstallmentProofsService, InstallmentProofRepository],
  exports: [InstallmentProofsService, InstallmentProofRepository],
})
export class InstallmentProofsModule {}
