import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DraftCampaignDto } from '@src/campaign/dto/draftCampaignDto';
import { PublishCampaignDto } from '@src/campaign/dto/publishCampaignDto';
import { CloudinaryService } from '@src/cloudinary/cloudinary.service';
import { CampaignRepository, CampaignStatus } from '@src/campaign/repository/campaign.repository';
import { NotificationService } from '@src/notification/notification.service';
import {
  StatusType,
  CategoryType,
  VariantType,
} from '@src/notification/dto/createNotificationDto';


@Injectable()
export class CampaignService {
  constructor(
    private readonly campaignRepository: CampaignRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly notificationService: NotificationService,
  ) {}

  // ! create and publish camnpaign------------------------------------------------------

  async createAndPublishCampaign(userId: string, data: PublishCampaignDto) {
    // Validate dates
    const startDate = new Date(data.startDate);

    if (startDate < new Date()) {
      throw new BadRequestException('Start date cannot be in the past');
    }
    
    // Calculate end date by adding days to start date
    const calculateEndDate = new Date(startDate);
    calculateEndDate.setDate(calculateEndDate.getDate() + data.duration);
    
    console.log(calculateEndDate.getDate() + data.duration);
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
        endDate: calculateEndDate,
        companyLogo: data.companyLogo,
        colorPallete: data.colorPallete,
        callToAction: data.callToAction,
        mainMessage: data.mainMessage,
        slogan: data.slogan,
        responseOnSeeingBanner: data.responseOnSeeingBanner,
        uploadedImages: data.uploadedImages,
        statusType: 'pending', // Published directly
      },
      userId,
    );
    if (!campaign)
      throw new InternalServerErrorException(
        'An error occcured, creating campaign, please try again',
      );

    await this.notificationService.createNotification(
      {
        title: 'Campaign created successfully',
        message:
          'The campaign has been created successfully, please you will have to have to wait till when things such as design is ready, and other factors to be in place afterwhich it will be published',
        variant: VariantType.INFO,
        category: CategoryType.CAMPAIGN,
        priority: '',
        status: StatusType.UNREAD,
      },
      userId,
    );

    return {
      message: 'Campaign created and published successfully',
      campaign,
    };
  }

  async draftCampaign(userId: string, data: DraftCampaignDto): Promise<any> {
    try {
      if (!userId || !data)
        throw new BadRequestException('Please provide userId and draft data');

      const calculateEndDate = new Date(data.startDate);
      calculateEndDate.setDate(calculateEndDate.getDate() + data.duration);
      const draft = await this.campaignRepository.draftCampaign(
        {
          ...data,
          statusType: 'draft',
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: calculateEndDate,
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

  async updateDraft(id: string, userId: string, data: DraftCampaignDto) {
    const existing = await this.campaignRepository.findDraftByIdAndUserId(
      id,
      userId,
    );

    if (!existing) {
      throw new NotFoundException('Draft not found or already published');
    }

    const startDate = new Date(data.startDate)

     const calculateEndDate = new Date(startDate);
     calculateEndDate.setDate(calculateEndDate.getDate() + data.duration);

    const updated = await this.campaignRepository.updateById(
      id,
      {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: calculateEndDate,
        updatedAt: new Date(),
      },
      userId,
    );

    return { message: 'Draft updated successfully', campaign: updated };
  }
  // //!---------------- publish camapaign draft------------------------------------------------------
  async publishDraftCampaign(
    id: string,
    userId: string,
    data: PublishCampaignDto,
  ) {
    const existing = await this.campaignRepository.findDraftByIdAndUserId(
      id,
      userId,
    );

    if (!existing) {
      throw new NotFoundException('Draft not found or already published');
    }

    const startDate = new Date(data.startDate);

     const calculateEndDate = new Date(startDate);
     calculateEndDate.setDate(calculateEndDate.getDate() + data.duration);

   

    if (!userId || !data)
      throw new BadRequestException('Please provide userId and draft data');

    const published = await this.campaignRepository.updateById(
      id,
      {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: calculateEndDate,
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
  //!---------------- get all published campaign particular to each business owners------------------------------

  async getCompleted(userId: string) {
    const campaigns =
      await this.campaignRepository.findCompletedByUserId(userId);

    return { campaigns };
  }
  //!---------------- get all published campaign particular to each business owners------------------------------

  async getActive(userId: string) {
    const campaigns = await this.campaignRepository.findActiveByUserId(userId);

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
  //!---------------- find campaign by status and userId ------------------------------------------------------

  async getCampaignsByStatusAndUserId(userId: string, status: any) {
    const campaign = await this.campaignRepository.findByStatus(
      userId,
      status,
    );

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return { campaign };
  }
}
