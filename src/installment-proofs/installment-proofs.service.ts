import { Injectable, BadRequestException } from '@nestjs/common';
import { InstallmentProofRepository } from '@src/installment-proofs/repository/installment-proofs.repository';
import { CampaignRepository } from '@src/campaign/repository/campaign.repository';
import { CreateInstallmentProofDto } from '@src/installment-proofs/dto/create-installment-proof.dto';

@Injectable()
export class InstallmentProofsService {
  constructor(
    private readonly installmentProofRepository: InstallmentProofRepository,
    private readonly campaignRepository: CampaignRepository,
  ) {}



    async uploadInstallmentProof(data:CreateInstallmentProofDto , campaignId: string, userId: string) {
      const validCampaign =
        await this.campaignRepository.getActiveDriverCampaignByCampaignId(campaignId, userId);

        if(!validCampaign) throw new BadRequestException('Installment proof can only be uploaded for approved campaigns')

      const previousInstallmentProof = await this.installmentProofRepository.getCampaignInstallmentProof(campaignId, userId)

      if(previousInstallmentProof?.statusType === 'approved') throw new BadRequestException('Installment proof has already been approved, therefore you cannot upload another installment proof')
      if(previousInstallmentProof) {
        
        return  await this.installmentProofRepository.updateInstallmentProof(
            data,
            campaignId,
            userId,
          );

      }
        return await this.installmentProofRepository.createInstallmentProof(data, campaignId, userId)
  
    }
}
