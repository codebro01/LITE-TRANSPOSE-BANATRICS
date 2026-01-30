import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { EarningService } from './earning.service';
import { CreateEarningDto } from './dto/create-earning.dto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import type { Response } from 'express';
import type { Request } from '@src/types';
import {  ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';

@Controller('earning')
export class EarningController {
  constructor(private readonly earningService: EarningService) {}

  // ! ===================================  driver section ==============================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver')
  @Post('request')
 @ApiCookieAuth('access_token')
  @ApiOperation({
    description: 'Request payout',
    summary: 'Driver requests payout whick will be approved by the admin',
  })
  @ApiResponse({
    status: 200,
    description: 'Request submitted successfully',
  })
  async requestPayouts(
    @Body() body: CreateEarningDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: userId } = req.user;
    const earning = await this.earningService.requestPayouts(body, userId);
    res.status(HttpStatus.CREATED).json({ message: 'success', data: earning });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver')
  @Get('list/all')
 @ApiCookieAuth('access_token')
  @ApiOperation({
    description: 'List all transactions',
    summary: 'List all drivers transactions',
  })
  @ApiResponse({
    status: 200,
    description: 'Fetched all transaction  successfully',
  })
  async listAllTransactions(@Req() req: Request, @Res() res: Response) {
    const { id: userId } = req.user;
    const earning = await this.earningService.listAllTransactions(userId);
    res.status(HttpStatus.OK).json({ message: 'success', data: earning });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver')
  @Get('dashboard')
 @ApiCookieAuth('access_token')
  @ApiOperation({
    description: 'Earning Dashboard',
    summary: 'Dashboard that contains infomation about drivers earnings',
  })
  @ApiResponse({
    status: 200,
    description: 'Dasboard Data fetched successfully',
  })
  async earningDashboard(@Req() req: Request, @Res() res: Response) {
    const { id: userId } = req.user;
    const earning = await this.earningService.earningDashboard(userId);
    res.status(HttpStatus.OK).json({ message: 'success', data: earning });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver')
  @Get('monthly-earnings')
 @ApiCookieAuth('access_token')
  @ApiOperation({
    description: 'Breakdown of monthly earnings',
    summary: 'Monthly earning information',
  })
  @ApiResponse({
    status: 200,
    description: 'Fetched monthly earning successfully',
  })
  async monthlyEarningBreakdown(@Req() req: Request, @Res() res: Response) {
    const { id: userId } = req.user;
    const earning = await this.earningService.monthlyEarningBreakdown(userId);
    res.status(HttpStatus.OK).json({ message: 'success', data: earning });
  }

  // ! ===================================  admin section   ==============================

//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles('admin')
//   @Post('/initialize')
//  @ApiCookieAuth('access_token')
//   @ApiOperation({
//     description: 'Initialize withdrawal',
//     summary: 'Admin initialize withdrawal',
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'Withdrawal initialized',
//   })
//   async initializeEarnings(
//     @Body() body: InitializeEarningDto,
//     @Res() res: Response,
//   ) {
//     const earning = await this.earningService.initializePayout(body);
//     res.status(HttpStatus.OK).json({ message: 'success', data: earning });
//   }

//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles('admin')
//   @Patch('status/update/:userId')
//  @ApiCookieAuth('access_token')
//   @ApiOperation({
//     description: 'Update earning approved status',
//     summary: 'Update earning approved status',
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'Earning  approved status updated successfully',
//   })
//   async updateEarningApprovedStatus(
//     @Query('approved') approved: boolean,
//     @Param('userId') userId: string,
//     @Req() req: Request,
//     @Res() res: Response,
//   ) {
//     // const { id: userId } = req.user;
//     const earning = await this.earningService.updateEarningApprovedStatus(
//       approved,
//       userId,
//     );
//     res.status(HttpStatus.OK).json({ message: 'success', data: earning });
//   }

//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles('admin')
//   @Get('list/unapproved')
//  @ApiCookieAuth('access_token')
//   @ApiOperation({
//     description: 'Admin lists and see all unapproved payouts',
//     summary: 'list all unapproved payouts',
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'Data fetched successfully',
//   })
//   async listAllUnapprovedEarnings(
//     @Query('approved') approved: boolean,
//     // @Req() req: Request,
//     @Res() res: Response,
//   ) {
//     const earning = await this.earningService.listAllUnapprovedEarnings();
//     res.status(HttpStatus.OK).json({ message: 'success', data: earning });
//   }
}
