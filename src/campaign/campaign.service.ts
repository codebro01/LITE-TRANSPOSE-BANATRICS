import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DraftCampaignDto } from '@src/campaign/dto/draftCampaignDto';
import { PublishCampaignDto } from '@src/campaign/dto/publishCampaignDto';
import { CloudinaryService } from '@src/cloudinary/cloudinary.service';
import { CampaignRepository } from '@src/campaign/repository/campaign.repository';

@Injectable()
export class CampaignService {
  constructor(
    private readonly campaignRepository: CampaignRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ! create and publish camnpaign------------------------------------------------------

  async createAndPublishCampaign(
    userId: string,
    data: PublishCampaignDto ,
  ) {
    // Validate dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    if (startDate < new Date()) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    const campaign = await this.campaignRepository.create(
      {
        packageType: data.packageType,
        duration: data.duration,
        revisions: data.revisions,
        price: data.price,
        noOfDrivers: data.noOfDrivers,
        campaignName: data.campaignName,
        campaignDescriptions: data.campaignDescriptions,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        companyLogo: data.companyLogo,
        colorPallete: data.colorPallete,
        callToAction: data.callToAction,
        mainMessage: data.mainMessage,
        slogan: data.slogan,
        responseOnSeeingBanner: data.responseOnSeeingBanner,
        uploadMediaFiles: data.uploadMediaFiles,
        statusType: 'pending', // Published directly
      },
      userId,
    );

    return {
      message: 'Campaign created and published successfully',
      campaign,
    };
  }

  //!---------------- save camapaign as draft------------------------------------------------------

  async draftCampaign(userId: string, data: DraftCampaignDto): Promise<any> {
    try {
      if (!userId || !data)
        throw new BadRequestException('Please provide userId and draft data');
      const draft = await this.campaignRepository.create(
        {
          ...data,
          statusType: 'draft',
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
        },
        userId,
      );

      return { message: 'Draft saved successfully', draft };
    } catch (error) {
      console.error('Insert Error:', error);

      throw error;
    }
  }
  //!---------------- update camapaign draft------------------------------------------------------

  async updateDraft(id: string, data: DraftCampaignDto, userId: string) {
    const existing = await this.campaignRepository.findDraftByIdAndUserId(
      id,
      userId,
    );

    if (!existing) {
      throw new NotFoundException('Draft not found or already published');
    }

    const updated = await this.campaignRepository.updateById(
      id,
      {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        updatedAt: new Date(),
      },
      userId,
    );

    return { message: 'Draft updated successfully', campaign: updated };
  }
  //!---------------- publish camapaign draft------------------------------------------------------
  async publishCampaign(id: string, data: PublishCampaignDto, userId: string) {
    const existing = await this.campaignRepository.findDraftByIdAndUserId(
      id,
      userId,
    );

    if (!existing) {
      throw new NotFoundException('Draft not found or already published');
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const published = await this.campaignRepository.create(
      {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        statusType: 'pending',
        updatedAt: new Date(),
      },
      userId,
    );

    return { message: 'Campaign published successfully', campaign: published };
  }

  //!---------------- get all camapaign particular to each business owners---------------------------

  async getAllCampaigns(userId: string) {
    const campaigns = await this.campaignRepository.findAllByUserId(userId);
    return { campaigns };
  }

  //!---------------- get all camapaign draft particular to each business owners-----------------------------

  async getDrafts(userId: string) {
    const drafts = await this.campaignRepository.findDraftsByUserId(userId);

    return { drafts };
  }

  //!---------------- get all published campaign particular to each business owners------------------------------

  async getPublished(userId: string) {
    const campaigns =
      await this.campaignRepository.findPublishedByUserId(userId);

    return { campaigns };
  }
  //!---------------- get single campaign by id------------------------------------------------------

  async getCampaignById(id: string, userId: string) {
    const campaign = await this.campaignRepository.findByIdAndUserId(
      id,
      userId,
    );

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return { campaign };
  }
}
