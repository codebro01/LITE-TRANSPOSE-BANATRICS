import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DraftCampaignDto } from '@src/campaign/dto/draftCampaignDto';
import { PublishCampaignDto } from '@src/campaign/dto/publishCampaignDto';
import { CloudinaryService } from '@src/cloudinary/cloudinary.service';
import {
  CampaignRepository,
  uploadType,
} from '@src/campaign/repository/campaign.repository';
import multer from 'multer';
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

  async createAndPublishCampaign(
    userId: string,
    data: PublishCampaignDto,
    uploadMediaFiles: multer.file[] = [],
    uploadLogo: multer.file = null,
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

    const maxFileSize = 5 * 1024 * 1024;

    if (uploadLogo.size > maxFileSize) {
      throw new BadRequestException('The maximum size for file uploads is 5mb');
    }

    for (const singleMediaFile of uploadMediaFiles) {
      if (singleMediaFile.size > maxFileSize)
        throw new BadRequestException(
          'The maximum size for each file upload is 5mb',
        );
    }

    let uploadedMediaFiles;
    let uploadedLogo;
    try {
      const [promise1, promise2] = await Promise.all([
        this.cloudinaryService.uploadMultipleImages(
          uploadMediaFiles,
          'campaign-folder',
        ),
        this.cloudinaryService.uploadImage(uploadLogo.buffer, 'logo-folder'),
      ]);

      uploadedMediaFiles = promise1;
      uploadedLogo = promise2;
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }

    uploadedLogo = {
      secure_url: uploadedLogo.secure_url,
      public_id: uploadedLogo.public_id,
    };
    uploadedMediaFiles = uploadedMediaFiles.map((file) => ({
      secure_url: file.secure_url,
      public_id: file.public_id,
    }));
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
        companyLogo: uploadedLogo,
        colorPallete: data.colorPallete,
        callToAction: data.callToAction,
        mainMessage: data.mainMessage,
        slogan: data.slogan,
        responseOnSeeingBanner: data.responseOnSeeingBanner,
        uploadMediaFiles: uploadedMediaFiles,
        statusType: 'pending', // Published directly
      },
      userId,
    );
    console.log(campaign);
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

  //!---------------- save camapaign as draft------------------------------------------------------

  // async draftCampaign(
  //   userId: string,
  //   data: DraftCampaignDto,
  //   uploadMediaFiles: multer.file[],
  //   uploadLogo: multer.file,
  // ): Promise<any> {
  //   try {
  //     if (!userId || !data)
  //       throw new BadRequestException('Please provide userId and draft data');

  //     let uploadedMediaFiles;
  //     let uploadedLogo;

  //     const maxFileSize = 5 * 1024 * 1024;

  //     if (uploadLogo) {
  //       if (uploadLogo.size > maxFileSize) {
  //         throw new BadRequestException(
  //           'The maximum size for file uploads is 5mb',
  //         );
  //       }

  //       const uploadLogoPromise = await this.cloudinaryService.uploadImage(
  //         uploadLogo.buffer,
  //         'logo-folder',
  //       );
  //       uploadedLogo = uploadLogoPromise;
  //     }

  //     if (uploadMediaFiles) {
  //       for (const singleMediaFile of uploadMediaFiles) {
  //         if (singleMediaFile.size > maxFileSize)
  //           throw new BadRequestException(
  //             'The maximum size for each file upload is 5mb',
  //           );
  //       }

  //       try {
  //         const [promise1] = await Promise.all([
  //           this.cloudinaryService.uploadMultipleImages(
  //             uploadMediaFiles,
  //             'campaign-folder',
  //           ),
  //         ]);

  //         uploadedMediaFiles = promise1;
  //       } catch (error: any) {
  //         throw new BadRequestException(error.message);
  //       }
  //     }

  //     uploadedLogo = {
  //       secure_url: uploadedLogo ? uploadedLogo.secure_url : null,
  //       public_id: uploadedLogo ? uploadedLogo.public_id : null,
  //     };
  //     uploadedMediaFiles = uploadedMediaFiles
  //       ? uploadedMediaFiles.map((file) => ({
  //           secure_url: file ? file.secure_url : null,
  //           public_id: file ? file.secure_url : null,
  //         }))
  //       : null;
  //     const draft = await this.campaignRepository.create(
  //       {
  //         ...data,
  //         uploadMediaFiles: uploadedMediaFiles,
  //         companyLogo: uploadedLogo,
  //         statusType: 'draft',
  //         startDate: data.startDate ? new Date(data.startDate) : null,
  //         endDate: data.endDate ? new Date(data.endDate) : null,
  //       },
  //       userId,
  //     );

  //     return { message: 'Draft saved successfully', draft };
  //   } catch (error) {
  //     console.error('Insert Error:', error);

  //     throw error;
  //   }
  // }

  async draftCampaign(
    userId: string,
    data: DraftCampaignDto,
    uploadMediaFiles: multer.file[],
    uploadLogo: multer.file,
  ): Promise<any> {
    try {
      if (!userId || !data)
        throw new BadRequestException('Please provide userId and draft data');

      const maxFileSize = 5 * 1024 * 1024;

      // Handle Logo
      let finalLogo;
      if (uploadLogo) {
        // New logo uploaded
        if (uploadLogo.size > maxFileSize) {
          throw new BadRequestException('Logo file size exceeds 5mb');
        }
        const uploaded = await this.cloudinaryService.uploadImage(
          uploadLogo.buffer,
          'logo-folder',
        );
        finalLogo = {
          secure_url: uploaded.secure_url,
          public_id: uploaded.public_id,
        };
      } else if (data.existingLogo) {
        // Keep existing logo
        finalLogo = data.existingLogo;
      } else {
        // No logo
        finalLogo = {
          secure_url: null,
          public_id: null,
        };
      }

      // Handle Media Files
      let finalMediaFiles: uploadType[] = [];

      // Keep existing media files
      if (data.existingMediaFiles && data.existingMediaFiles.length > 0) {
        finalMediaFiles = [...data.existingMediaFiles];
      }

      // Upload new media files
      if (uploadMediaFiles && uploadMediaFiles.length > 0) {
        for (const file of uploadMediaFiles) {
          if (file.size > maxFileSize) {
            throw new BadRequestException('Media file size exceeds 5mb');
          }
        }

        const newUploads = await this.cloudinaryService.uploadMultipleImages(
          uploadMediaFiles,
          'campaign-folder',
        );

        const mappedUploads = newUploads.map((file) => ({
          secure_url: file.secure_url,
          public_id: file.public_id,
        }));

        finalMediaFiles = [...finalMediaFiles, ...mappedUploads];
      }

      const draft = await this.campaignRepository.draftCampaign(
        {
          ...data,
          uploadMediaFiles: finalMediaFiles.length > 0 ? finalMediaFiles : null,
          companyLogo: finalLogo,
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

  async updateDraft(
    id: string,
    userId: string,
    data: DraftCampaignDto,
    uploadLogo: multer.files,
    uploadMediaFiles: multer.files[],
  ) {
    const existing = await this.campaignRepository.findDraftByIdAndUserId(
      id,
      userId,
    );

    if (!existing) {
      throw new NotFoundException('Draft not found or already published');
    }

    let uploadedMediaFiles;
    let uploadedLogo;

    const maxFileSize = 5 * 1024 * 1024;

    if (uploadLogo) {
      if (uploadLogo.size > maxFileSize) {
        throw new BadRequestException(
          'The maximum size for file uploads is 5mb',
        );
      }

      const uploadLogoPromise = await this.cloudinaryService.uploadImage(
        uploadLogo.buffer,
        'logo-folder',
      );
      uploadedLogo = uploadLogoPromise;
    }

    if (data.existingMediaFiles && data.existingMediaFiles.length > 0) {
      uploadedMediaFiles = [...data.existingMediaFiles];
    }

    if (uploadMediaFiles) {
      for (const singleMediaFile of uploadMediaFiles) {
        if (singleMediaFile.size > maxFileSize)
          throw new BadRequestException(
            'The maximum size for each file upload is 5mb',
          );
      }

      try {
        const uploadFilePromise =
          await this.cloudinaryService.uploadMultipleImages(
            uploadMediaFiles,
            'campaign-folder',
          );

        uploadedMediaFiles =
          data.existingMediaFiles && data.existingMediaFiles.length > 0
            ? [...data.existingMediaFiles, ...uploadFilePromise]
            : uploadFilePromise;
      } catch (error: any) {
        throw new BadRequestException(error.message);
      }
    }

    uploadedLogo = {
      secure_url: uploadedLogo ? uploadedLogo.secure_url : null,
      public_id: uploadedLogo ? uploadedLogo.public_id : null,
    };
    uploadedMediaFiles = uploadedMediaFiles
      ? uploadedMediaFiles.map((file) => ({
          secure_url: file ? file.secure_url : null,
          public_id: file ? file.secure_url : null,
        }))
      : null;

    const updated = await this.campaignRepository.updateById(
      id,
      {
        ...data,
        uploadMediaFiles: uploadedMediaFiles,
        companyLogo: uploadedLogo || data.existingLogo,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
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
    uploadMediaFiles: multer.file[],
    uploadLogo: multer.file,
  ) {
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

    if (!userId || !data)
      throw new BadRequestException('Please provide userId and draft data');

    const maxFileSize = 5 * 1024 * 1024;

    // Handle Logo
    let finalLogo;
    if (uploadLogo) {
      // New logo uploaded
      if (uploadLogo.size > maxFileSize) {
        throw new BadRequestException('Logo file size exceeds 5mb');
      }
      const uploaded = await this.cloudinaryService.uploadImage(
        uploadLogo.buffer,
        'logo-folder',
      );
      finalLogo = {
        secure_url: uploaded.secure_url,
        public_id: uploaded.public_id,
      };
    } else if (data.existingLogo) {
      // Keep existing logo
      finalLogo = data.existingLogo;
    } else {
      // No logo
      throw new BadRequestException('Please upload a logo file');
    }

    // Handle Media Files
    let finalMediaFiles: uploadType[] = [];

    // Keep existing media files
    if (data.existingMediaFiles && data.existingMediaFiles.length > 0) {
      finalMediaFiles = [...data.existingMediaFiles];
    }

    // Upload new media files
    if (uploadMediaFiles && uploadMediaFiles.length > 0) {
      for (const file of uploadMediaFiles) {
        if (file.size > maxFileSize) {
          throw new BadRequestException('Media file size exceeds 5mb');
        }
      }

      const newUploads = await this.cloudinaryService.uploadMultipleImages(
        uploadMediaFiles,
        'campaign-folder',
      );

      const mappedUploads = newUploads.map((file) => ({
        secure_url: file.secure_url,
        public_id: file.public_id,
      }));

      finalMediaFiles = [...finalMediaFiles, ...mappedUploads];
    }

    const published = await this.campaignRepository.updateById(
      id,
      {
        ...data,
        uploadMediaFiles: finalMediaFiles,
        companyLogo: finalLogo,
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

  async getCampaignsByStatusAndUserId(id: string, userId: string) {
    const campaign = await this.campaignRepository.findByIdAndUserId(
      userId,
      status,
    );

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return { campaign };
  }
}
