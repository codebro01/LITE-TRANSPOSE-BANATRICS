import { Controller, HttpStatus, Req, Res, Get } from '@nestjs/common';
import { HomeDashboardService } from '@src/dashboard/dashboard.service';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { Roles } from '@src/auth/decorators/roles.decorators';
import  type { Response } from 'express';
import type { Request } from '@src/types';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';


@ApiTags('home-dashboards')
@Controller('home-dashboard')
export class DashboardController {
  constructor(private readonly homeDashboardService: HomeDashboardService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Business owner home dashboard',
    description: 'This loads the business owner home dashboard',
  })
  @ApiResponse({
    status: 200,
    description: 'dashboard loaded successfully',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Get('businessOwner')
  async businessOwnerDashboard(@Req() req: Request, @Res() res: Response) {
    const userId = req.user.id;

    const campaign =
      await this.homeDashboardService.businessOwnerHomeDashboard(userId);
    res.status(HttpStatus.CREATED).json({
      message: 'success',
      data: campaign,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Driver home dashboard',
    description: 'This loads the driver home dashboard',
  })
  @ApiResponse({
    status: 200,
    description: 'dashboard loaded successfully',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver')
  @Get('driver')
  async driverDashboard(@Req() req: Request, @Res() res: Response) {
    const userId = req.user.id;

    const campaign =
      await this.homeDashboardService.driverHomeDashboard(userId);
    res.status(HttpStatus.CREATED).json({
      message: 'success',
      data: campaign,
    });
  }
}
