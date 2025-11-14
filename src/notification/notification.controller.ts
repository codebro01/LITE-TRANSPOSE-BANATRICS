import { Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { CreateNotificationDto } from '@src/notification/dto/createNotificationDto';
import { Body, Req, Res, Sse } from '@nestjs/common';
import { Observable, interval } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import type { Request } from '@src/types';
import type { Response } from 'express';
import { NotificationService } from '@src/notification/notification.service';
import { notificationTableSelectType } from '@src/db/notifications';

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
}
