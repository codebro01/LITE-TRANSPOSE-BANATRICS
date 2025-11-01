import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UploadedFile,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DraftCampaignDto } from '@src/campaign/dto/draftCampaignDto';
import { PublishCampaignDto } from '@src/campaign/dto/publishCampaignDto';
import { CloudinaryService } from '@src/cloudinary/cloudinary.service';
import { CampaignRepository } from '@src/campaign/repository/campaign.repository';
import multer from 'multer';

@Injectable()
export class CampaignService {
  constructor(
    private readonly campaignRepository: CampaignRepository,
    private readonly cloudinaryService: CloudinaryService,
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

    return {
      message: 'Campaign created and published successfully',
      campaign,
    };
  }

  //!---------------- save camapaign as draft------------------------------------------------------

  async draftCampaign(
    userId: string,
    data: DraftCampaignDto,
    uploadMediaFiles: multer.file[],
    uploadLogo: multer.file,
  ): Promise<any> {
    try {
      if (!userId || !data)
        throw new BadRequestException('Please provide userId and draft data');
      
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



      if (uploadMediaFiles) {
        for (const singleMediaFile of uploadMediaFiles) {
          if (singleMediaFile.size > maxFileSize)
            throw new BadRequestException(
              'The maximum size for each file upload is 5mb',
            );
        }

        try {
          const [promise1] = await Promise.all([
            this.cloudinaryService.uploadMultipleImages(
              uploadMediaFiles,
              'campaign-folder',
            ),
          ]);

          uploadedMediaFiles = promise1;
        } catch (error: any) {
          throw new BadRequestException(error.message);
        }
      }

      uploadedLogo = {
        secure_url: uploadedLogo ? uploadedLogo.secure_url : null,
        public_id: uploadedLogo ? uploadedLogo.public_id : null,
      };
      uploadedMediaFiles = uploadedMediaFiles ? uploadedMediaFiles.map((file) => ({
        secure_url: file ? file.secure_url : null,
        public_id: file ? file.secure_url : null,
      })) : null;
      const draft = await this.campaignRepository.create(
        {
          ...data,
          uploadMediaFiles: uploadedMediaFiles,
          companyLogo: uploadedLogo,
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
        uploadMediaFiles: [
          {
            secure_url: '',
            public_id: '',
          },
        ],
        companyLogo: {
          secure_url: '',
          public_id: '',
        },
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
        uploadMediaFiles: [
          {
            secure_url: '',
            public_id: '',
          },
        ],
        companyLogo: {
          secure_url: '',
          public_id: '',
        },
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
