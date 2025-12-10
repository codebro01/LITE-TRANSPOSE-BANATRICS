import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  Res, 
  UseGuards,
  HttpStatus,
  Query
} from '@nestjs/common';
import { EarningService } from './earning.service';
import { CreateEarningDto } from './dto/create-earning.dto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { InitializeEarningDto } from '@src/earning/dto/initialize-earning.dto';
import type { Response } from 'express';
import type { Request } from '@src/types';

@Controller('earning')
export class EarningController {
  constructor(private readonly earningService: EarningService) {}

  // ! ===================================  driver section ==============================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver')
  @Post('request')
  async requestPayouts(
    @Body() body: CreateEarningDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: userId } = req.user;
    const earning = await this.earningService.requestPayouts(body, userId);
    res.status(HttpStatus.OK).json({ message: 'success', data: earning });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver')
  @Get('list/all')
  async listAllTransactions(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: userId } = req.user;
    const earning = await this.earningService.listAllTransactions(userId);
    res.status(HttpStatus.OK).json({ message: 'success', data: earning });
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver')
  @Get('dashboard')
  async earningDashboard(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: userId } = req.user;
    const earning = await this.earningService.earningDashboard(userId);
    res.status(HttpStatus.OK).json({ message: 'success', data: earning });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver')
  @Get('dashboard')
  async monthlyEarningBreakdown(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: userId } = req.user;
    const earning = await this.earningService.monthlyEarningBreakdown(userId);
    res.status(HttpStatus.OK).json({ message: 'success', data: earning });
  }

 

  // ! ===================================  admin section   ==============================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('/initialize')
  async initializeEarnings(
    @Body() body: InitializeEarningDto,
    @Res() res: Response,
  ) {
    const earning = await this.earningService.initializePayout(body);
    res.status(HttpStatus.OK).json({ message: 'success', data: earning });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('status/update/:userId')
  async updateEarningApprovedStatus(
    @Query('approved') approved: boolean,
    @Param('userId') userId: string, 
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // const { id: userId } = req.user;
    const earning = await this.earningService.updateEarningApprovedStatus(
      approved,
      userId,
    );
    res.status(HttpStatus.OK).json({ message: 'success', data: earning });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('list/unapproved')
  async listAllUnapprovedEarnings(
    @Query('approved') approved: boolean,
    // @Req() req: Request,
    @Res() res: Response,
  ) {
    const earning = await this.earningService.listAllUnapprovedEarnings();
    res.status(HttpStatus.OK).json({ message: 'success', data: earning });
  }
}
