import {
  Controller,
  UseGuards,
  Req,
  Res,
  Body,
  Patch,
  Get,
  Post,
  HttpStatus,
  Param, 
  Query
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { PublishCampaignDto } from './dto/publishCampaignDto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { CampaignService } from '@src/campaign/campaign.service';
import { CloudinaryService } from '@src/cloudinary/cloudinary.service';
import {
  DraftCampaignDto,
  StatusType,
} from '@src/campaign/dto/draftCampaignDto';
import type { Response } from 'express';
import type { Request } from '@src/types';

@ApiTags('Campaign')
@Controller('campaign')
export class CampaignController {
  constructor(
    private readonly campaignService: CampaignService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Post('create/publish')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create and publish campaign',
    description:
      'Creates a new campaign and immediately publishes it for approval. Requires campaign images (up to 5) and company logo. Available only to business owners.',
  })
  @ApiBody({
    type: PublishCampaignDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Campaign published successfully, awaiting approval',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Missing images or company logo',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a business owner',
  })
  async createAndPublishCampaign(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: PublishCampaignDto,
  ) {
    const userId = req.user.id;

    const campaign = await this.campaignService.createAndPublishCampaign(
      userId,
      body,
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
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create campaign draft',
    description:
      'Creates a new campaign as a draft. Images and company logo are optional. Can be completed and published later.',
  })
  @ApiBody({
    type: DraftCampaignDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Draft saved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a business owner',
  })
 
  async draftCampaign(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: DraftCampaignDto,
  ) {
    const userId = req.user.id;

    const campaign = await this.campaignService.draftCampaign(userId, body);
    res.status(HttpStatus.CREATED).json({
      message: 'Draft saved successfully',
      data: campaign,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Patch('update/draft/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update campaign draft',
    description:
      'Updates an existing campaign draft. Can update campaign details, images, and company logo.',
  })
  @ApiQuery({
    name: 'id',
    required: true,
    type: String,
    description: 'Campaign draft ID',
  })
  @ApiBody({
    type: DraftCampaignDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Campaign updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid campaign ID',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the owner of this campaign',
  })
  @ApiResponse({
    status: 404,
    description: 'Campaign not found',
  })
  async updateCampaign(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: DraftCampaignDto,
    @Param() param: { id: string },
  ) {
    const userId = req.user.id;
    const id = param.id;
    const campaign = await this.campaignService.updateDraft(id, userId, body);
    res.status(HttpStatus.CREATED).json({
      message: 'Campaign updated successfully',
      data: campaign,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Patch('publish/draft/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Publish draft campaign',
    description:
      'Publishes an existing draft campaign for approval. Updates draft with final details before publishing.',
  })
  @ApiQuery({
    name: 'id',
    required: true,
    type: String,
    description: 'Campaign draft ID to publish',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Campaign images (max 5, optional)',
        },
        companyLogo: {
          type: 'string',
          format: 'binary',
          description: 'Company logo (optional)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Campaign published successfully, awaiting approval',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid or incomplete campaign data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the owner of this campaign',
  })
  @ApiResponse({
    status: 404,
    description: 'Campaign draft not found',
  })
  async publishDraftCampaign(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: DraftCampaignDto,
    @Param() param: { id: string },
  ) {
    const userId = req.user.id;
    const id = param.id;

    const campaign = await this.campaignService.publishDraftCampaign(
      id,
      userId,
      body,
    );
    res.status(HttpStatus.CREATED).json({
      message: 'Campaign published successfully',
      data: campaign,
    });
  }

  // !  get all campaign owned by business owners
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Get('get-campaigns')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all campaigns',
    description:
      'Retrieves all campaigns owned by the authenticated business owner, regardless of status.',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully retrieved all campaigns',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a business owner',
  })
  async getAllCampaigns(@Req() req: Request, @Res() res: Response) {
    const userId = req.user.id;

    const campaign = await this.campaignService.getAllCampaigns(userId);
    res.status(HttpStatus.CREATED).json({
      message: 'success',
      data: campaign,
    });
  }

  // !  get all campaign draft owned by business owners
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Get('get-drafts')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all draft campaigns',
    description:
      'Retrieves all draft campaigns owned by the authenticated business owner.',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully retrieved all draft campaigns',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a business owner',
  })
  async getAllCampaignsDraft(@Req() req: Request, @Res() res: Response) {
    const userId = req.user.id;

    const campaign = await this.campaignService.getDrafts(userId);
    res.status(HttpStatus.CREATED).json({
      message: 'success',
      data: campaign,
    });
  }

  // !  get all campaign published owned by business owners
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Get('get-published')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all published campaigns',
    description:
      'Retrieves all published campaigns owned by the authenticated business owner.',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully retrieved all published campaigns',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a business owner',
  })
  async getAllCampaignsPublished(@Req() req: Request, @Res() res: Response) {
    const userId = req.user.id;

    const campaign = await this.campaignService.getPublished(userId);
    res.status(HttpStatus.CREATED).json({
      message: 'Success',
      data: campaign,
    });
  }

  // !  get all campaign completed by business owners
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Get('get-completed')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all completed campaigns',
    description:
      'Retrieves all completed campaigns owned by the authenticated business owner.',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully retrieved all completed campaigns',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a business owner',
  })
  async getAllCampaignsCompleted(@Req() req: Request, @Res() res: Response) {
    const userId = req.user.id;

    const campaign = await this.campaignService.getCompleted(userId);
    res.status(HttpStatus.CREATED).json({
      message: 'success',
      data: campaign,
    });
  }

  // !  get single campaign owned by business owners
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Get('get-campaign/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get single campaign',
    description:
      'Retrieves a specific campaign by ID owned by the authenticated business owner.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'Campaign ID',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully retrieved campaign',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the owner of this campaign',
  })
  @ApiResponse({
    status: 404,
    description: 'Campaign not found',
  })
  async getSingleCampaign(
    @Req() req: Request,
    @Res() res: Response,
    @Param() param: { id: string },
  ) {
    const userId = req.user.id;
    const id = param.id;
    const campaign = await this.campaignService.getCampaignById(id, userId);
    res.status(HttpStatus.CREATED).json({
      message: 'success',
      data: campaign,
    });
  }

  // !  get all campaign owned by business owners and filter by status
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Get('get-campaigns-by-status')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get campaigns by status',
    description:
      'Retrieves campaigns owned by the authenticated business owner filtered by specific status.',
  })
  // @ApiBody({ type: StatusType })
  @ApiResponse({
    status: 201,
    description: 'Successfully retrieved campaigns by status',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid status type',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a business owner',
  })
  async getCampaignsByStatusAndUserId(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: StatusType,
  ) {
    const userId = req.user.id;
    const campaign = await this.campaignService.getCampaignsByStatusAndUserId(
      userId,
      query,
    );
    res.status(HttpStatus.CREATED).json({
      message: 'success',
      data: campaign,
    });
  }

  // *========================= Busines owner section ended=======================


// !============================driver section =================================

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('driver')
@Get('get-all-available-campaigns')
async getAllAVailableCampaigns() {
  const campaigns = await this.campaignService.getAllAvailableCampaigns();
  return {message: 'success', data: campaigns}
}


}
