import {
  Controller,
  Body,
  Patch,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Req, 
  Post,
} from '@nestjs/common';
import { InstallmentProofsService } from './installment-proofs.service';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import type { Request } from '@src/types';
import { CreateInstallmentProofDto } from '@src/installment-proofs/dto/create-installment-proof.dto';

@Controller('installment-proofs')
export class InstallmentProofsController {
  constructor(
    private readonly installmentProofsService: InstallmentProofsService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver')
  @Post(':campaignId')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Upload an installment proof',
    description: 'Upload an installment proof for a specific campaign using camapign id',
  })
  @HttpCode(HttpStatus.OK)
  // @ApiQuery({
  //   name: 'campaignId',
  //   required: false,
  //   type: String,
  //   description: 'Optional campaign ID to filter applications',
  // })
  // @ApiQuery({
  //   name: 'driverId',
  //   required: false,
  //   type: String,
  //   description: 'Optional driver ID to filter applications',
  // })
  async getCampaignInstallmentProof(
    @Req() req: Request,
    @Body() body: CreateInstallmentProofDto, 
    @Param('campaignId', ParseUUIDPipe) campaignId: string,
  ) {

    const {id: userId} = req.user;
    const installmentProofs =
      await this.installmentProofsService.createInstallmentProof(
        body,
        campaignId,
        userId,
      );

    return {
      success: true,
      data: installmentProofs,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver')
  @Patch(':campaignId')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'update installment proofs',
    description: 'Update an existing installment proof',
  })
  @HttpCode(HttpStatus.OK)
  async approveOrRejectInstallmentProof(
    @Body('body') body: CreateInstallmentProofDto,
    @Param('campaignId', ParseUUIDPipe) campaignId: string,
        @Req() req: Request,

  ) {

        const {id: userId} = req.user;

    const installmentProofs =
      await this.installmentProofsService.updateInstallmentProof(
        body,
        campaignId,
        userId,
      );

    return {
      success: true,
      data: installmentProofs,
    };
  }
}
