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
import {
  CampaignRepository,
  CampaignStatus,
} from '@src/campaign/repository/campaign.repository';
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
import { PaymentService } from '@src/payment/payment.service';
import {
  generateSecureInvoiceId,
  PaymentRepository,
} from '@src/payment/repository/payment.repository';
import {
  CampaignDesignStatusType,
  UpdateCampaignDesignDto,
} from '@src/campaign/dto/update-campaign-design.dto';
import { InvoiceRepository } from '@src/invoice/repository/invoice.repository';
@Injectable()
export class CampaignService {
  constructor(
    private readonly campaignRepository: CampaignRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly notificationService: NotificationService,
    private readonly packageRepository: PackageRepository,
    private readonly paymentService: PaymentService,
    private readonly paymentRepository: PaymentRepository,
    private readonly InvoiceRepository: InvoiceRepository,
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
    let Trx: any;
    const isNotCustomPackageType =
      await this.packageRepository.findByPackageType(data.packageType);

    console.log(isNotCustomPackageType);

    //! This handles predefined package types
    if (isNotCustomPackageType.length > 0) {
      // Calculate end date by adding days to start date
      const calculateEndDate = new Date(startDate);
      calculateEndDate.setDate(
        calculateEndDate.getDate() + isNotCustomPackageType[0].duration,
      );

      console.log(
        calculateEndDate.getDate() + isNotCustomPackageType[0].duration,
      );
      Trx = await this.paymentRepository.executeInTransaction(async (trx) => {
        campaign = await this.campaignRepository.create(
          {
            packageType: isNotCustomPackageType[0].packageType as PackageType,
            duration: isNotCustomPackageType[0].duration,
            revisions: isNotCustomPackageType[0].revisions,
            price: isNotCustomPackageType[0].price,
            noOfDrivers: isNotCustomPackageType[0].noOfDrivers,
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
            statusType: CampaignStatus.PENDING, // Published directly
          },
          userId,
          trx,
        );
        if (!campaign)
          throw new InternalServerErrorException(
            'An error occcured, creating campaign, please try again',
          );

        await this.paymentService.makePaymentForCampaign(
          { campaignId: campaign.id },
          userId,
          trx,
        );
        if (!campaign.price)
          throw new BadRequestException('Could not create campaign.');
        await this.InvoiceRepository.create(
          {
            amount: campaign.price,
            invoiceId: generateSecureInvoiceId(),
          },
          campaign.id,
          userId,
          trx,
        );

        return campaign;
      });
    }
    //! This handles custom package types
    else {
      const calculateEndDate = new Date(startDate);

      if (!data.endDate)
        throw new BadRequestException(
          'End date must be provided for custom campaigns',
        );

      const endDate = new Date(data.endDate);

      const minEndDate = new Date(startDate);
      minEndDate.setDate(minEndDate.getDate() + 30);

      if (endDate < minEndDate) {
        throw new BadRequestException('Campaign must run for at least 30 days');
      }
      // if (!data.duration)
      //   throw new BadRequestException(
      //     'duration is required if package type is custom',

      //   );

      const duration = data.duration || 0;
      calculateEndDate.setDate(calculateEndDate.getDate() + duration);

      // console.log(calculateEndDate.getDate() + data.duration);
      Trx = await this.paymentRepository.executeInTransaction(async (trx) => {
        campaign = await this.campaignRepository.create(
          {
            packageType: data.packageType,
            duration: data.duration || undefined,
            revisions: data.revisions,
            price: data.noOfDrivers ? data.noOfDrivers * 120000 : 0,
            noOfDrivers: data.noOfDrivers ? data.noOfDrivers : 0,
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
            statusType: CampaignStatus.PENDING, // Published directly
          },
          userId,
          trx,
        );
        if (!campaign)
          throw new InternalServerErrorException(
            'An error occcured, creating campaign, please try again',
          );
        await this.paymentService.makePaymentForCampaign(
          { campaignId: campaign.id },
          userId,
          trx,
        );

        if (!campaign.price)
          throw new BadRequestException('Could not create campaign.');
        await this.InvoiceRepository.create(
          {
            amount: campaign.price,
            invoiceId: generateSecureInvoiceId(),
          },
          campaign.id,
          userId,
          trx,
        );

        return campaign;
      });
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
      'businessOwner',
    );

    return {
      message: 'Campaign created and published successfully',
      campaign: Trx.campaign,
    };
  }

  //* save campaign as draft ------------------------------------------------------

  async draftCampaign(userId: string, data: DraftCampaignDto): Promise<any> {
    try {
      if (data.statusType !== CampaignStatus.DRAFT)
        throw new BadRequestException(
          'Please set statusType to draft to draft campaigns',
        );
      if (!userId || !data)
        throw new BadRequestException('Please provide userId and draft data');

      if (!data.packageType)
        throw new BadRequestException('Package type must be provided!!!');

      console.log(data);

      if (
        (data.packageType === PackageType.STARTER ||
          data.packageType === PackageType.BASIC ||
          data.packageType === PackageType.PREMIUM) &&
        (data.duration ||
          data.noOfDrivers ||
          data.endDate ||
          data.maintenanceType ||
          data.lgaCoverage ||
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

      // ! For predefined packages

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
            ...data,
            packageType: isNotCustomPackageType[0].packageType as PackageType,
            duration: isNotCustomPackageType[0].duration,
            revisions: isNotCustomPackageType[0].revisions,
            price: isNotCustomPackageType[0].price,
            noOfDrivers: isNotCustomPackageType[0].noOfDrivers,
            maintenanceType: isNotCustomPackageType[0]
              .maintenanceType as MaintenanceType,
            endDate: calculateEndDate,
            startDate: data.startDate ? new Date(startDate) : null,
            statusType: CampaignStatus.DRAFT, // Published directly
          },
          userId,
        );
        if (!draft)
          throw new InternalServerErrorException(
            'An error occcured, creating draft, please try again',
          );
      }
      // ! For custom packages
      else {
        if (!data.endDate)
          throw new BadRequestException(
            'End date must be provided for custom campaigns',
          );

        const endDate = new Date(data.endDate);

        const minEndDate = new Date(startDate);
        minEndDate.setDate(minEndDate.getDate() + 30);

        if (endDate < minEndDate) {
          throw new BadRequestException(
            'Campaign must run for at least 30 days',
          );
        }

        draft = await this.campaignRepository.draftCampaign(
          {
            ...data,
            price: data.noOfDrivers ? data.noOfDrivers * 120000 : 0,
            noOfDrivers: data.noOfDrivers ? data.noOfDrivers : 0,
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null,
            statusType: CampaignStatus.DRAFT,
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
    // console.log(id, userId)
    if (data.statusType !== CampaignStatus.DRAFT)
      throw new BadRequestException(
        'Please set statusType to draft to draft campaigns',
      );
    const startDate = new Date(data.startDate);

    if (startDate < new Date())
      throw new BadRequestException('Start date cannot be in the past');

    const existing = await this.campaignRepository.findDraftByIdAndUserId(
      id,
      userId,
    );

    console.log('existing', existing);

    if (!existing) {
      throw new NotFoundException('Draft not found or already published');
    }
    let updated: campaignSelectType | null = null;
    const isNotCustomPackageType =
      await this.packageRepository.findByPackageType(data.packageType);

    //! For predefined packages
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
          ...data,
          packageType: isNotCustomPackageType[0].packageType as PackageType,
          duration: isNotCustomPackageType[0].duration,
          revisions: isNotCustomPackageType[0].revisions,
          price: isNotCustomPackageType[0].price,
          noOfDrivers: isNotCustomPackageType[0].noOfDrivers,
          maintenanceType: isNotCustomPackageType[0]
            .maintenanceType as MaintenanceType,
          endDate: calculateEndDate,
          startDate: data.startDate ? new Date(data.startDate) : null,
          statusType: CampaignStatus.DRAFT, // Published directly
        },
        userId,
      );
      if (!updated)
        throw new InternalServerErrorException(
          'An error occcured, creating draft, please try again',
        );
    }
    //! For custom Packages
    else {
      if (!data.endDate)
        throw new BadRequestException(
          'End date must be provided for custom campaigns',
        );

      const endDate = new Date(data.endDate);

      const minEndDate = new Date(startDate);
      minEndDate.setDate(minEndDate.getDate() + 30);

      if (endDate < minEndDate) {
        throw new BadRequestException('Campaign must run for at least 30 days');
      }
      updated = await this.campaignRepository.updateById(
        id,
        {
          ...data,
          price: data.noOfDrivers ? data.noOfDrivers * 120000 : 0,
          noOfDrivers: data.noOfDrivers ? data.noOfDrivers : 0,
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

    const startDate = new Date(data.startDate);

    if (startDate < new Date())
      throw new BadRequestException('Start date cannot be in the past');

    const existing = await this.campaignRepository.findDraftByIdAndUserId(
      id,
      userId,
    );

    if (!existing) {
      throw new NotFoundException('Draft not found or already published');
    }

    let published: campaignSelectType | null = null;
    let Trx: any;

    const isNotCustomPackageType =
      await this.packageRepository.findByPackageType(data.packageType);

    // ! For predefined packages
    if (isNotCustomPackageType.length > 0) {
      // Calculate end date by adding days to start date
      const calculateEndDate = new Date(data.startDate);
      calculateEndDate.setDate(
        calculateEndDate.getDate() + isNotCustomPackageType[0].duration,
      );

      console.log(
        calculateEndDate.getDate() + isNotCustomPackageType[0].duration,
      );

      if (
        !data.startDate ||
        !data.campaignName ||
        !data.callToAction ||
        !data.campaignDescriptions ||
        !data.colorPallete ||
        !data.mainMessage ||
        !data.companyLogo ||
        !data.responseOnSeeingBanner ||
        !data.slogan
      )
        throw new BadRequestException(
          'startDate, campaignName, callToAction, campaignDescriptions, colorPallete, mainMessage, companyLogo, responseOnSeeingBanner, and slogal are all required to publish campaign',
        );

      Trx = await this.paymentRepository.executeInTransaction(async (trx) => {
        published = await this.campaignRepository.updateById(
          id,
          {
            packageType: isNotCustomPackageType[0].packageType as PackageType,
            duration: isNotCustomPackageType[0].duration,
            revisions: isNotCustomPackageType[0].revisions,
            price: isNotCustomPackageType[0].price,
            noOfDrivers: isNotCustomPackageType[0].noOfDrivers,
            maintenanceType: isNotCustomPackageType[0]
              .maintenanceType as MaintenanceType,

            endDate: calculateEndDate,
            startDate: data.startDate ? new Date(data.startDate) : null,
            statusType: CampaignStatus.PENDING, // Published directly
          },
          userId,
          trx,
        );
        if (!published)
          throw new InternalServerErrorException(
            'An error occcured, creating draft, please try again',
          );

        await this.paymentService.makePaymentForCampaign(
          { campaignId: published.id },
          userId,
          trx,
        );

        if (!published.price)
          throw new BadRequestException('Could not create campaign.');
        await this.InvoiceRepository.create(
          {
            amount: published.price,
            invoiceId: generateSecureInvoiceId(),
          },
          published.id,
          userId,
          trx,
        );

        return { published };
      });
    }

    // ! For custom packages
    else {
      if (
        !data.startDate ||
        !data.campaignName ||
        !data.callToAction ||
        !data.campaignDescriptions ||
        !data.colorPallete ||
        !data.mainMessage ||
        !data.companyLogo ||
        !data.responseOnSeeingBanner ||
        !data.slogan ||
        !data.endDate ||
        !data.noOfDrivers
      )
        throw new BadRequestException(
          'startDate, endDate, campaignName, callToAction, campaignDescriptions, colorPallete, mainMessage, companyLogo, responseOnSeeingBanner, and slogal are all required to publish campaign',
        );

      const endDate = new Date(data.endDate);

      const minEndDate = new Date(startDate);
      minEndDate.setDate(minEndDate.getDate() + 30);

      if (endDate < minEndDate) {
        throw new BadRequestException('Campaign must run for at least 30 days');
      }

      Trx = await this.paymentRepository.executeInTransaction(async (trx) => {
        published = await this.campaignRepository.updateById(
          id,
          {
            ...data,
            price: data.noOfDrivers ? data.noOfDrivers * 120000 : 0,
            noOfDrivers: data.noOfDrivers ? data.noOfDrivers : 0,
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null,
            updatedAt: new Date(),
            statusType: CampaignStatus.PENDING,
          },
          userId,
          trx,
        );
        if (!published)
          throw new InternalServerErrorException(
            'An error occcured, creating draft, please try again',
          );

        await this.paymentService.makePaymentForCampaign(
          { campaignId: published.id },
          userId,
          trx,
        );

        if (!published.price)
          throw new BadRequestException('Could not create campaign.');
        await this.InvoiceRepository.create(
          {
            amount: published.price,
            invoiceId: generateSecureInvoiceId(),
          },
          published.id,
          userId,
          trx,
        );

        return { published };
      });
    }


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
       'businessOwner',
     );

    return {
      message: 'Campaign published successfully',
      campaign: Trx.published,
    };
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
    const campaign =
      await this.campaignRepository.findCampaignByCampaignIdAndUserId(
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

  // *---------------approve - - reject campaign designs

  async approveOrRejectCampaignDesign(
    data: UpdateCampaignDesignDto,
    campaignId: string,
  ) {
    if (
      data.approvalStatus === CampaignDesignStatusType.REJECT &&
      !data.comment
    )
      throw new BadRequestException(
        'Comment must be provided, if campaign design is rejected',
      );
    const validCampaign =
      await this.campaignRepository.findCampaignDesignByCampaignId(campaignId);

    if (!validCampaign)
      throw new NotFoundException('Campaign design not found for update');
    const approveOrReject =
      await this.campaignRepository.approveOrRejectCampaignDesign(
        data,
        campaignId,
      );
    return approveOrReject;
  }

  //!===================================drivers db calls ===========================================//

  //*---------------- get all available campaigns  ------------------------------------------------------

  async getAllAvailableCampaigns(userId: string) {
    const campaigns =
      await this.campaignRepository.getAllAvailableCampaigns(userId);
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
          ...campaign,
          monthlyEarning,
          daysRemaining: duration,
          daysCompleted: 0,
          campaignProgress: 0,
          isExpired: false,
          notStarted: true,
        };
      }

      const startDate = new Date(campaign.startDate);
      const today = new Date();

      // Campaign hasn't started yet
      if (today < startDate) {
        const daysUntilStart = Math.ceil(
          (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );

        return {
          ...campaign,
          monthlyEarning: Math.round(monthlyEarning * 100) / 100,
          daysRemaining: duration, // Full duration remains
          daysCompleted: 0,
          campaignProgress: 0,
          daysUntilStart, // New field showing when it starts
          notStarted: true,
          isExpired: false,
        };
      }

      // Campaign has started
      const daysCompleted = Math.floor(
        (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      const daysRemaining = Math.max(0, duration - daysCompleted);
      const campaignProgress = Math.min(100, (daysCompleted / duration) * 100);
      const isExpired = daysCompleted >= duration;

      return {
        ...campaign,
        monthlyEarning: Math.round(monthlyEarning * 100) / 100,
        daysRemaining,
        daysCompleted,
        campaignProgress: Math.round(campaignProgress * 100) / 100,
        notStarted: false,
        isExpired,
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
  async getAllActiveDriverCampaigns(userId: string) {
    return await this.campaignRepository.getAllActiveDriverCampaigns(userId);
  }
  async getAllCompletedCampaigns(userId: string) {
    return await this.campaignRepository.getAllCompletedCampaigns(userId);
  }

  async driverApplyForCampaign(data: CreateDriverCampaignDto, userId: string) {
    const alreadyApplied = await this.campaignRepository.findDriverCampaignById(
      data.campaignId,
      userId,
    );
    if (alreadyApplied)
      throw new BadRequestException(
        'You have already applied for this campaign!!!',
      );

    const existingCampaign =
      await this.campaignRepository.getAllActiveDriverCampaigns(userId);
    console.log('existing campaign', existingCampaign);
    if (existingCampaign && existingCampaign.length > 0)
      throw new BadRequestException(
        'You cannot apply for another campaign because you already have an active campaign.',
      );
    const createDriverCampaign =
      await this.campaignRepository.createDriverCampaign(data, userId);
    if (!createDriverCampaign)
      throw new InternalServerErrorException(
        'An error occured while trying to apply for the campaign',
      );
  }
}
