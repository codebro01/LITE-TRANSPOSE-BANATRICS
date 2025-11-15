import {
//   BadRequestException,
  Controller,
  HttpStatus,
  Post,
  UseGuards,Body, Req, Res, Sse, Query, Param, Get
} from '@nestjs/common';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { CreateNotificationDto } from '@src/notification/dto/createNotificationDto';
import { interval } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import type { Request } from '@src/types';
import type { Response } from 'express';
import { NotificationService } from '@src/notification/notification.service';
// import { notificationTableSelectType } from '@src/db/notifications';
import { UpdateNotificationDto } from '@src/notification/dto/updateNotificationDto';
import { UpdateNotificationsQueryDto } from '@src/notification/dto/updateNotificationQueryDto';
import { FilterNotificationsDto } from '@src/notification/dto/filterNotificationDto';

@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner', 'driver')
  @Sse('stream')
  streamNotifications(@Req() req: Request) {
    const userId = req.user.id; // Get from auth

    return interval(5000).pipe(
      switchMap(() => this.notificationService.getNotifications(userId)),
      map((notifications: any) => {
        return {
          data: {
            notifications,
            count: notifications.length,
          },
        };
      }),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('create-notification')
  async createNotification(
    @Body() body: CreateNotificationDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: userId } = req.user;
    const notification = await this.notificationService.createNotification(
      body,
      userId,
    );

    res.status(HttpStatus.OK).json({ message: 'success', data: notification });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('update-notification/:id')
  async updateNotification(
    @Body() body: UpdateNotificationDto,
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') notificationId: string,
  ) {
    const { id: userId } = req.user;
    const notification = await this.notificationService.updateNotification(
      body,
      notificationId,
      userId,
    );

    res.status(HttpStatus.OK).json({ message: 'success', data: notification });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin, businessOwner, driver')
  @Post('update-notifications')
  async updateNotifications(
    @Body() body: UpdateNotificationDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('ids') query: UpdateNotificationsQueryDto
  ) {
    const { id: userId } = req.user;

    const notification = await this.notificationService.updateNotifications(
      body,
      query.ids,
      userId,
    );

    res.status(HttpStatus.OK).json({ message: 'success', data: notification });
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'businessOwner', 'driver')
  @Get('dashboard-data')
  async notificationDashboard(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: userId } = req.user;

    const notification = await this.notificationService.notificationDashboard(
      userId,
    );

    res.status(HttpStatus.OK).json({ message: 'success', data: notification });
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'businessOwner', 'driver')
  @Get('filter')
  async notificationFilters(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: FilterNotificationsDto
  ) {
    const { id: userId } = req.user;

    const notification = await this.notificationService.filterNotifications(
        query, 
      userId,
    );

    res.status(HttpStatus.OK).json({ message: 'success', data: notification });
  }
}
