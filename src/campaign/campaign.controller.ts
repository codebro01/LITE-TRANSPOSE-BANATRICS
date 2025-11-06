import {
  Controller,
  UseGuards,
  Req,
  Res,
  UseInterceptors,
  Body,
  UploadedFiles,
  Patch,
  Get,
  Post,
  Delete,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  FilesInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import multer, { StorageEngine } from 'multer';
import { PublishCampaignDto } from './dto/publishCampaignDto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { CampaignService } from '@src/campaign/campaign.service';
import { CloudinaryService } from '@src/cloudinary/cloudinary.service';
import { DraftCampaignDto } from './dto/draftCampaignDto';

@Controller('campaign')
export class CampaignController {
  constructor(
    private readonly campaignService: CampaignService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Post('create/publish')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'files', maxCount: 5 },
        { name: 'companyLogo', maxCount: 1 },
      ],
      {
        storage: multer.memoryStorage() as StorageEngine,
      },
    ),
  )
  async createAndPublishCampaign(
    @Req() req,
    @Res() res,
    @Body() body: PublishCampaignDto,
    @UploadedFiles() files: multer.file,
  ) {
    const userId = req.user.id;
    if (!files.files || files.files.length === 0) {
      throw new BadRequestException('Please upload at least one image');
    }
    if (!files.companyLogo || files.companyLogo.length === 0) {
      throw new BadRequestException('Please upload company logo');
    }

    const campaign = await this.campaignService.createAndPublishCampaign(
      userId,
      body,
      files.files,
      files.companyLogo[0],
    );
    res.status(HttpStatus.CREATED).json({
      message:
        'Campaign published successfully, Please kindly wait for it to be approved',
      data: campaign,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Post('create/draft')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'files', maxCount: 5 },
        { name: 'companyLogo', maxCount: 1 },
      ],
      {
        storage: multer.memoryStorage() as StorageEngine,
      },
    ),
  )
  async draftCampaign(
    @Req() req,
    @Res() res,
    @Body() body: DraftCampaignDto,
    @UploadedFiles() files: multer.file,
  ) {
    const userId = req.user.id;

    const campaign = await this.campaignService.draftCampaign(
      userId,
      body,
      files.files ? files.files : null,
      files.companyLogo ? files.companyLogo[0] : null,
    );
    res.status(HttpStatus.CREATED).json({
      message:
        'Draft saved successfully',
      data: campaign,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Post('create/draft')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'files', maxCount: 5 },
        { name: 'companyLogo', maxCount: 1 },
      ],
      {
        storage: multer.memoryStorage() as StorageEngine,
      },
    ),
  )
  async updateCampaign(
    @Req() req,
    @Res() res,
    @Body() body: DraftCampaignDto,
    @UploadedFiles() files: multer.file,
  ) {
    const userId = req.user.id;
    const { id } = req.query;

    const campaign = await this.campaignService.updateDraft(
      id,
      userId,
      body,
      files.files ? files.files : null,
      files.companyLogo ? files.companyLogo[0] : null,
    );
    res.status(HttpStatus.CREATED).json({
      message:
        'Campaign published successfully, Please kindly wait for it to be approved',
      data: campaign,
    });
  }
}
