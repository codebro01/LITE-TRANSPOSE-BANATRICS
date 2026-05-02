import { Injectable, BadRequestException } from '@nestjs/common';
import { InstallmentProofRepository } from '@src/installment-proofs/repository/installment-proofs.repository';
import { CampaignRepository } from '@src/campaign/repository/campaign.repository';
import { CreateInstallmentProofDto } from '@src/installment-proofs/dto/create-installment-proof.dto';
import { UserRepository } from '@src/users/repository/user.repository';
import { NotificationService } from '@src/notification/notification.service';
import {
  CategoryType,
  StatusType,
  VariantType,
} from '@src/notification/dto/createNotificationDto';

@Injectable()
export class InstallmentProofsService {
  constructor(
    private readonly installmentProofRepository: InstallmentProofRepository,
    private readonly campaignRepository: CampaignRepository,
    private readonly userRepository: UserRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async uploadInstallmentProof(
    data: CreateInstallmentProofDto,
    campaignId: string,
    userId: string,
  ) {
    const validCampaign =
      await this.campaignRepository.getActiveDriverCampaignByCampaignId(
        campaignId,
        userId,
      );

    if (!validCampaign)
      throw new BadRequestException(
        'Installment proof can only be uploaded for approved campaigns',
      );

    const previousInstallmentProof =
      await this.installmentProofRepository.getCampaignInstallmentProof(
        campaignId,
        userId,
      );

    if (previousInstallmentProof?.statusType === 'approved')
      throw new BadRequestException(
        'Installment proof has already been approved, therefore you cannot upload another installment proof',
      );
    if (previousInstallmentProof) {
      const admins = await this.userRepository.getAllAdmins();
      const campaign =
        await this.campaignRepository.findCampaignByCampaignId(campaignId);

      await Promise.all([
        ...admins.map((admin) =>
          this.notificationService.createNotification(
            {
              title: 'New Installment Proof Re-submission',
              message: `New Installment proof submission for campaign titled ${campaign.campaignName}, please check for approval`,
              variant: VariantType.INFO,
              category: CategoryType.CAMPAIGN,
              priority: '',
              status: StatusType.UNREAD,
            },
            admin.userId,
            'admin',
          ),
        ),
      ]);
      return await this.installmentProofRepository.updateInstallmentProof(
        data,
        campaignId,
        userId,
      );
    }
        const admins = await this.userRepository.getAllAdmins();
        const campaign =
          await this.campaignRepository.findCampaignByCampaignId(campaignId);

        await Promise.all([
          ...admins.map((admin) =>
            this.notificationService.createNotification(
              {
                title: 'New Installment Proof Submission',
                message: `New Installment proof submission for campaign titled ${campaign.campaignName}, please check for approval`,
                variant: VariantType.INFO,
                category: CategoryType.CAMPAIGN,
                priority: '',
                status: StatusType.UNREAD,
              },
              admin.userId,
              'admin',
            ),
          ),
        ]);
    return await this.installmentProofRepository.createInstallmentProof(
      data,
      campaignId,
      userId,
    );
  }
}
