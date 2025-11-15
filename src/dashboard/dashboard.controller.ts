import { Controller, HttpStatus, Req, Res, Get } from '@nestjs/common';
import { HomeDashboardService } from '@src/dashboard/dashboard.service';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { Roles } from '@src/auth/decorators/roles.decorators';
import  type { Response } from 'express';
import type { Request } from '@src/types';


@Controller('home-dashboard')
export class DashboardController {
  constructor(private readonly homeDashboardService: HomeDashboardService) {}


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('businessOwner')
    @Get('/businessOwner')
    async getAllCampaigns(@Req() req: Request, @Res() res: Response) {
      const userId = req.user.id;
  
      const campaign = await this.homeDashboardService.businessOwnerHomeDashboard(userId);
      res.status(HttpStatus.CREATED).json({
        message: 'success',
        data: campaign,
      });
    }
}
