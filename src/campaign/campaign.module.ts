import { Module } from '@nestjs/common';
import { CampaignController } from './campaign.controller';
import { CampaignService } from '@src/campaign/campaign.service';
import { CampaignRepository } from './repository/campaign.repository';
import { DbProvider } from '@src/db/provider';
import { CloudinaryService } from '@src/cloudinary/cloudinary.service';
import { NotificationModule } from '@src/notification/notification.module';
import { PackageModule } from '@src/package/package.module';

@Module({
  imports: [NotificationModule, PackageModule],
  controllers: [CampaignController],
  providers: [CampaignService,CloudinaryService,  CampaignRepository, DbProvider],
  exports: [CampaignRepository, CampaignService],
})
export class CampaignModule {}
