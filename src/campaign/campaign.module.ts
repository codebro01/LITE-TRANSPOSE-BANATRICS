import { Module } from '@nestjs/common';
import { CampaignController } from './campaign.controller';
import { CampaignService } from '@src/campaign/campaign.service';
import { CampaignRepository } from './repository/campaign.repository';
import { DbProvider } from '@src/db/provider';
import { CloudinaryService } from '@src/cloudinary/cloudinary.service';

import { NotificationService } from '@src/notification/notification.service';
import { NotificationModule } from '@src/notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [CampaignController],
  providers: [CampaignService,CloudinaryService,  CampaignRepository, DbProvider],
  exports: [CampaignRepository, CampaignService],
})
export class CampaignModule {}
