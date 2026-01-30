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



    async createInstallmentProof(data:CreateInstallmentProofDto , campaignId: string, userId: string) {
      const validCampaign =
        await this.campaignRepository.getActiveDriverCampaignByCampaignId(campaignId, userId);

        if(!validCampaign) throw new BadRequestException('Installment proof can only be uploaded for approved campaigns')
        const installmentProof = await this.installmentProofRepository.createInstallmentProof(data, campaignId, userId)
  
          return installmentProof;
    }
  
  
    async updateInstallmentProof(data:CreateInstallmentProofDto , campaignId: string, userId: string) {
        const installmentProof = await this.installmentProofRepository.updateInstallmentProof(data, campaignId, userId)
  
          return installmentProof;
    }
}
