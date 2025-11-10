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
  // Delete,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import multer, { StorageEngine } from 'multer';
import { PublishCampaignDto } from './dto/publishCampaignDto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { CampaignService } from '@src/campaign/campaign.service';
import { CloudinaryService } from '@src/cloudinary/cloudinary.service';
import { DraftCampaignDto, StatusType } from '@src/campaign/dto/draftCampaignDto';

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
      message: 'Draft saved successfully',
      data: campaign,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Patch('update/draft')
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
      message: 'Campaign updated successfully',
      data: campaign,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Patch('publish/draft')
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
  async publishDraftCampaign(
    @Req() req,
    @Res() res,
    @Body() body: DraftCampaignDto,
    @UploadedFiles() files: multer.file,
  ) {
    const userId = req.user.id;
    const { id } = req.query;

    const campaign = await this.campaignService.publishDraftCampaign(
      id,
      userId,
      body,
      files.files ? files.files : null,
      files.companyLogo ? files.companyLogo[0] : null,
    );
    res.status(HttpStatus.CREATED).json({
      message: 'Campaign updated successfully',
      data: campaign,
    });
  }

  // !  get all campaign owned by business owners
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Get('get-all')
  async getAllCampaigns(@Req() req, @Res() res) {
    const userId = req.user.id;

    const campaign = await this.campaignService.getAllCampaigns(userId);
    res.status(HttpStatus.CREATED).json({
      message: 'Campaign updated successfully',
      data: campaign,
    });
  }

  // !  get all campaign draft owned by business owners
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Get('get-all-drafts')
  async getAllCampaignsDraft(@Req() req, @Res() res) {
    const userId = req.user.id;

    const campaign = await this.campaignService.getDrafts(userId);
    res.status(HttpStatus.CREATED).json({
      message: 'Campaign updated successfully',
      data: campaign,
    });
  }
  // !  get all campaign publised owned by business owners
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Get('get-all-published')
  async getAllCampaignsPublished(@Req() req, @Res() res) {
    const userId = req.user.id;

    const campaign = await this.campaignService.getPublished(userId);
    res.status(HttpStatus.CREATED).json({
      message: 'Campaign updated successfully',
      data: campaign,
    });
  }
  // !  get all campaign completed by business owners
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Get('get-all-completed')
  async getAllCampaignsCompleted(@Req() req, @Res() res) {
    const userId = req.user.id;

    const campaign = await this.campaignService.getCompleted(userId);
    res.status(HttpStatus.CREATED).json({
      message: 'Campaign updated successfully',
      data: campaign,
    });
  }
  // !  get all campaign publised owned by business owners
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Get('get-all-active')
  async getAllCampaignActive(@Req() req, @Res() res) {
    const userId = req.user.id;

    const campaign = await this.campaignService.getActive(userId);
    res.status(HttpStatus.CREATED).json({
      message: 'Campaign updated successfully',
      data: campaign,
    });
  }

  // !  get single campaign owned by business owners
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Get('get-single/:id')
  async getSingleCampaign(@Req() req, @Res() res) {
    const userId = req.user.id;
    const { id } = req.query;
    const campaign = await this.campaignService.getCampaignById(id, userId);
    res.status(HttpStatus.CREATED).json({
      message: 'Campaign updated successfully',
      data: campaign,
    });
  }
  // !  get all campaign owned by business owners and filter by status
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Get('get-campaigns-by-status')
  async getCampaignsByStatusAndUserId(@Req() req, @Res() res, @Body() body: StatusType) {
    const userId = req.user.id;
    const campaign = await this.campaignService.getCampaignsByStatusAndUserId(
      body,
      userId,
    );
    res.status(HttpStatus.CREATED).json({
      message: 'Campaign updated successfully',
      data: campaign,
    });
  }
}
