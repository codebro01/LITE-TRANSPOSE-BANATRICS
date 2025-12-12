import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DraftCampaignDto } from '@src/campaign/dto/draftCampaignDto';
import {
  MaintenanceType,
  PackageType,
  PublishCampaignDto,
} from '@src/campaign/dto/publishCampaignDto';
import { CloudinaryService } from '@src/cloudinary/cloudinary.service';
import { CampaignRepository } from '@src/campaign/repository/campaign.repository';
import { NotificationService } from '@src/notification/notification.service';
import {
  StatusType,
  CategoryType,
  VariantType,
} from '@src/notification/dto/createNotificationDto';
import { PackageRepository } from '@src/package/repository/package.repository';
import { campaignSelectType } from '@src/db';
import {
  CreateDriverCampaignDto,
  DriverCampaignStatusType,
} from '@src/campaign/dto/create-driver-campaign.dto';
import { CronExpression, Cron } from '@nestjs/schedule';
import { updatePricePerDriverPerCampaign } from '@src/campaign/dto/update-price-per-driver-per-campaign.dto';


@Injectable()
export class CampaignService {
  constructor(
    private readonly campaignRepository: CampaignRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly notificationService: NotificationService,
    private readonly packageRepository: PackageRepository,
  ) {}

  //!===================================business owner db calls ===========================================//

  //* create and publish camnpaign------------------------------------------------------

  async createAndPublishCampaign(userId: string, data: PublishCampaignDto) {
    if (!data.packageType)
      throw new BadRequestException('Package type must be provided!!!');

    if (
      (data.packageType === PackageType.STARTER ||
        data.packageType === PackageType.BASIC ||
        data.packageType === PackageType.PREMIUM) &&
      (data.duration ||
        data.noOfDrivers ||
        data.endDate ||
        data.maintenanceType ||
        data.lgaCoverage ||
        data.price ||
        data.revisions)
    ) {
      throw new BadRequestException(
        'if package type is not custom then then fields duration, noOfDrivers, endDate, maintenanceType, lgaCoverage, price and revision will auto generated',
      );
    }
    const startDate = new Date(data.startDate);

    if (startDate < new Date()) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    let campaign: campaignSelectType;
    const isNotCustomPackageType =
      await this.packageRepository.findByPackageType(data.packageType);
    if (isNotCustomPackageType.length > 0) {
      // Calculate end date by adding days to start date
      const calculateEndDate = new Date(startDate);
      calculateEndDate.setDate(
        calculateEndDate.getDate() + isNotCustomPackageType[0].duration,
      );

      console.log(
        calculateEndDate.getDate() + isNotCustomPackageType[0].duration,
      );
      campaign = await this.campaignRepository.create(
        {
          packageType: isNotCustomPackageType[0].packageType,
          duration: isNotCustomPackageType[0].duration,
          revisions: isNotCustomPackageType[0].revisions,
          price: isNotCustomPackageType[0].price,
          noOfDrivers: isNotCustomPackageType[0].noOfDrivers,
          lgaCoverage: isNotCustomPackageType[0].lgaCoverage,
          maintenanceType: isNotCustomPackageType[0]
            .maintenanceType as MaintenanceType,
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
    } else {
      const calculateEndDate = new Date(startDate);
      // if (!data.duration)
      //   throw new BadRequestException(
      //     'duration is required if package type is custom',


      //   );

      const duration  = data.duration || 0
      calculateEndDate.setDate(calculateEndDate.getDate() + duration);

      // console.log(calculateEndDate.getDate() + data.duration);
      campaign = await this.campaignRepository.create(
        {
          packageType: data.packageType,
          duration: data.duration || null,
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
          uploadedImages: data.uploadedImages,
          statusType: 'pending', // Published directly
        },
        userId,
      );
      if (!campaign)
        throw new InternalServerErrorException(
          'An error occcured, creating campaign, please try again',
        );
    }

    // Calculate end date by adding days to start date

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

  //* save campaign as draft ------------------------------------------------------

  async draftCampaign(userId: string, data: DraftCampaignDto): Promise<any> {
    try {
      if (!userId || !data)
        throw new BadRequestException('Please provide userId and draft data');

      if (!data.packageType)
        throw new BadRequestException('Package type must be provided!!!');

      if (
        (data.packageType === PackageType.STARTER ||
          data.packageType === PackageType.BASIC ||
          data.packageType === PackageType.PREMIUM) &&
        (data.duration ||
          data.noOfDrivers ||
          data.endDate ||
          data.maintenanceType ||
          data.lgaCoverage ||
          data.price ||
          data.revisions)
      ) {
        throw new BadRequestException(
          'if package type is not custom then then fields duration, noOfDrivers, endDate, maintenanceType, lgaCoverage, price and revision will auto generated',
        );
      }

      const startDate = new Date(data.startDate);

      if (startDate && startDate < new Date()) {
        throw new BadRequestException('Start date cannot be in the past');
      }

      let draft: campaignSelectType | null = null;
      const isNotCustomPackageType =
        await this.packageRepository.findByPackageType(data.packageType);

      if (isNotCustomPackageType.length > 0) {
        // Validate dates

        // Calculate end date by adding days to start date
        const calculateEndDate = new Date(startDate);
        calculateEndDate.setDate(
          calculateEndDate.getDate() + isNotCustomPackageType[0].duration,
        );

        console.log(
          calculateEndDate.getDate() + isNotCustomPackageType[0].duration,
        );
        draft = await this.campaignRepository.draftCampaign(
          {
            packageType: isNotCustomPackageType[0].packageType,
            duration: isNotCustomPackageType[0].duration,
            revisions: isNotCustomPackageType[0].revisions,
            price: isNotCustomPackageType[0].price,
            noOfDrivers: isNotCustomPackageType[0].noOfDrivers,
            lgaCoverage: isNotCustomPackageType[0].lgaCoverage,
            maintenanceType: isNotCustomPackageType[0]
              .maintenanceType as MaintenanceType,
            endDate: calculateEndDate,
            startDate: data.startDate ? new Date(startDate) : null,
            statusType: 'draft', // Published directly
          },
          userId,
        );
        if (!draft)
          throw new InternalServerErrorException(
            'An error occcured, creating draft, please try again',
          );
      } else {
        draft = await this.campaignRepository.draftCampaign(
          {
            ...data,
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null,
            statusType: 'draft',
          },
          userId,
        );
      }

      return { message: 'Draft saved successfully', draft };
    } catch (error) {
      console.error('Insert Error:', error);
      throw error;
    }
  }
  //*---------------- update camapaign draft------------------------------------------------------

  async updateDraft(id: string, userId: string, data: DraftCampaignDto) {
    const existing = await this.campaignRepository.findDraftByIdAndUserId(
      id,
      userId,
    );

    if (!existing) {
      throw new NotFoundException('Draft not found or already published');
    }
    let updated: campaignSelectType | null = null;
    const isNotCustomPackageType =
      await this.packageRepository.findByPackageType(data.packageType);

    if (isNotCustomPackageType.length > 0) {
      // Calculate end date by adding days to start date
      const calculateEndDate = new Date(data.startDate);
      calculateEndDate.setDate(
        calculateEndDate.getDate() + isNotCustomPackageType[0].duration,
      );

      console.log(
        calculateEndDate.getDate() + isNotCustomPackageType[0].duration,
      );
      updated = await this.campaignRepository.updateById(
        id,
        {
          packageType: isNotCustomPackageType[0].packageType,
          duration: isNotCustomPackageType[0].duration,
          revisions: isNotCustomPackageType[0].revisions,
          price: isNotCustomPackageType[0].price,
          noOfDrivers: isNotCustomPackageType[0].noOfDrivers,
          lgaCoverage: isNotCustomPackageType[0].lgaCoverage,
          maintenanceType: isNotCustomPackageType[0]
            .maintenanceType as MaintenanceType,
          endDate: calculateEndDate,
          startDate: data.startDate ? new Date(data.startDate) : null,
          statusType: 'draft', // Published directly
        },
        userId,
      );
      if (!updated)
        throw new InternalServerErrorException(
          'An error occcured, creating draft, please try again',
        );
    } else {
      updated = await this.campaignRepository.updateById(
        id,
        {
          ...data,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          updatedAt: new Date(),
        },
        userId,
      );
    }

    return { message: 'Draft updated successfully', campaign: updated };
  }
  //*---------------- publish camapaign draft------------------------------------------------------
  async publishDraftCampaign(
    id: string,
    userId: string,
    data: PublishCampaignDto,
  ) {
    if (!userId || !data)
      throw new BadRequestException('Please provide userId and draft data');

    const existing = await this.campaignRepository.findDraftByIdAndUserId(
      id,
      userId,
    );

    if (!existing) {
      throw new NotFoundException('Draft not found or already published');
    }

    let published: campaignSelectType | null = null;

    const isNotCustomPackageType =
      await this.packageRepository.findByPackageType(data.packageType);

    if (isNotCustomPackageType.length > 0) {
      // Calculate end date by adding days to start date
      const calculateEndDate = new Date(data.startDate);
      calculateEndDate.setDate(
        calculateEndDate.getDate() + isNotCustomPackageType[0].duration,
      );

      console.log(
        calculateEndDate.getDate() + isNotCustomPackageType[0].duration,
      );
      published = await this.campaignRepository.updateById(
        id,
        {
          packageType: isNotCustomPackageType[0].packageType,
          duration: isNotCustomPackageType[0].duration,
          revisions: isNotCustomPackageType[0].revisions,
          price: isNotCustomPackageType[0].price,
          noOfDrivers: isNotCustomPackageType[0].noOfDrivers,
          lgaCoverage: isNotCustomPackageType[0].lgaCoverage,
          maintenanceType: isNotCustomPackageType[0]
            .maintenanceType as MaintenanceType,
          endDate: calculateEndDate,
          startDate: data.startDate ? new Date(data.startDate) : null,
          statusType: 'pending', // Published directly
        },
        userId,
      );
      if (!published)
        throw new InternalServerErrorException(
          'An error occcured, creating draft, please try again',
        );
    } else {
      published = await this.campaignRepository.updateById(
        id,
        {
          ...data,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          updatedAt: new Date(),
          statusType: 'pending',
        },
        userId,
      );
    }

    return { message: 'Campaign published successfully', campaign: published };
  }

  //*---------------- get all camapaign particular to each business owners---------------------------

  async getAllCampaigns(userId: string) {
    const campaigns = await this.campaignRepository.findAllByUserId(userId);
    return { campaigns };
  }

  //*---------------- get all camapaign draft particular to each business owners-----------------------------

  async getDrafts(userId: string) {
    const drafts = await this.campaignRepository.findDraftsByUserId(userId);

    return { drafts };
  }

  //*---------------- get all published campaign particular to each business owners------------------------------

  async getPublished(userId: string) {
    const campaigns =
      await this.campaignRepository.findPublishedByUserId(userId);

    return { campaigns };
  }
  //*---------------- get all published campaign particular to each business owners------------------------------

  async getCompleted(userId: string) {
    const campaigns =
      await this.campaignRepository.findCompletedByUserId(userId);

    return { campaigns };
  }
  //*---------------- get all published campaign particular to each business owners------------------------------

  async getActive(userId: string) {
    const campaigns = await this.campaignRepository.findActiveByUserId(userId);

    return { campaigns };
  }
  //*---------------- get single campaign by id------------------------------------------------------

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
  //*---------------- find campaign by status and userId ------------------------------------------------------

  async getCampaignsByStatusAndUserId(userId: string, status: any) {
    const campaign = await this.campaignRepository.findByStatus(userId, status);

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return { campaign };
  }

  //!===================================drivers db calls ===========================================//

  //*---------------- get all available campaigns  ------------------------------------------------------

  async getAllAvailableCampaigns() {
    const campaigns = await this.campaignRepository.getAllAvailableCampaigns();
    return campaigns;
  }

  async driverCampaignDashboard(userId: string) {
    const result =
      await this.campaignRepository.driverCampaignDashboard(userId);

    const { campaignCounts, eligibleCampaignsCount } = result;

    const { totalActiveCampaigns, totalCompletedCampaigns } = campaignCounts;
    const { eligibleCampaigns } = eligibleCampaignsCount;
    const successRate =
      eligibleCampaigns > 0
        ? ((totalCompletedCampaigns / eligibleCampaigns) * 100).toFixed(2)
        : 0;

    return { totalActiveCampaigns, totalCompletedCampaigns, successRate };
  }

  async getDriverCampaignsById(userId: string) {
    const campaigns =
      await this.campaignRepository.getDriverCampaignsById(userId);

    const calc = campaigns.map((campaign) => {
      const totalEarning = campaign.totalEarning || 0;
      const duration = campaign.duration || 0;

      const monthlyEarning = totalEarning / (duration / 30);

      if (!campaign.startDate) {
        return {
          monthlyEarning,
          daysRemaining: duration, // Full duration remains if not started
          daysPassed: 0,
          isExpired: false,
          notStarted: true,
        };
      }

      const startDate = new Date(campaign.startDate);
      const today = new Date();

      const daysCompleted = Math.floor(
        (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      const daysRemaining = Math.max(0, duration - daysCompleted);

      const campaignProgress = (daysCompleted / duration) * 100;

      return {
        ...campaign,
        monthlyEarning: Math.round(monthlyEarning * 100) / 100,
        daysRemaining,
        daysCompleted,
        campaignProgress,
      };
    });

    return calc;
  }

  async filterDriverCampaigns(
    filter: DriverCampaignStatusType,
    userId: string,
  ) {
    return await this.campaignRepository.filterDriverCampaigns(filter, userId);
  }
  async getAllActiveCampaigns(userId: string) {
    return await this.campaignRepository.getAllActiveCampaigns(userId);
  }
  async getAllCompletedCampaigns(userId: string) {
    return await this.campaignRepository.getAllCompletedCampaigns(userId);
  }

  async driverApplyForCampaign(data: CreateDriverCampaignDto, userId: string) {
    await this.campaignRepository.driverApplyForCampaign(data, userId);
  }

  // !====================== admin section ===================================================

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCampaignStatusUpdate() {
    console.log('Running campaign status update job...');

    const result = await this.campaignRepository.handleCampaignStatusUpdate();

    return result;
  }

  async updateCampaignStatusManually() {
    const result = await this.campaignRepository.updateCampaignStatusManually();

    return result;
  }
  async updatePricePerDriverPerCampaign(data:updatePricePerDriverPerCampaign) {
    const result =
      await this.campaignRepository.updatePricePerDriverPerCampaign(data);

    return result;
  }
}
