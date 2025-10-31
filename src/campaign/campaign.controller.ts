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
  BadRequestException
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import multer, { StorageEngine } from 'multer';
import { PublishCampaignDto } from './dto/publishCampaignDto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { CampaignService } from '@src/campaign/campaign.service';
import { CloudinaryService } from '@src/cloudinary/cloudinary.service';

@Controller('campaign')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService,     private readonly cloudinaryService: CloudinaryService
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Post('create/publish')
  @UseInterceptors(
     FilesInterceptor('files', 5, {
        storage: multer.memoryStorage() as StorageEngine,
      }),
  )
  async createAndPublishCampaign(
    @Req() req,
    @Res() res,
    @Body() body: PublishCampaignDto,
    @UploadedFiles() files: multer.file,
  ) {
    const userId = req.user.id;
    let data = body;
      if (!files || files.length === 0) {
          throw new BadRequestException('Please upload at least one image');
        }

          const results = await this.cloudinaryService.uploadImage(
            files.map((f) => f.buffer),
            'campaign-folder',
          );

          console.log(results)

          
          // data = { uploadMediaFiles: results, ...data };
    const campaign = await this.campaignService.createAndPublishCampaign(
      userId,
      data,
    );
    res
      .status(HttpStatus.CREATED)
      .json({
        message:
          'Campaign published successfully, Please kindly wait for it to be approved',
        data: campaign,
      });
  }
}
