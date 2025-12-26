import {
//   BadRequestException,
  Controller,
  HttpStatus,
  Post,
  UseGuards,Body, Req, Res, Sse, Query, Param, Get, Patch, Headers
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
import { FilterNotificationsDto } from '@src/notification/dto/filterNotificationDto';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiProduces,
  ApiHeader, 
} from '@nestjs/swagger';
import { UpdateNotificationsDto } from '@src/notification/dto/updateNotificationsDto';

@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner', 'driver')
  @Get('all')
  @ApiOperation({
    summary: 'Get all notifications',
    description: 'This endpoints fetches all user notifications',
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications fetched successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have required role',
  })
  @ApiHeader({
    name: 'x-active-role',
    description:
      'The role context for this operation (e.g., businessOwner, driver)',
    required: true,
    schema: {
      type: 'string',
      enum: ['businessOwner', 'driver', 'admin'],
      default: 'businessOwner',
    },
  })
  async getNotifications(
    @Req() req: Request,
    @Headers('x-active-role') activeRole?: string,
  ) {
    const user = req.user;

    const roleToUse =
      activeRole && user.role.includes(activeRole) ? activeRole : user.role[0];

    const notifications = await this.notificationService.getNotifications({
      userId: user.id,
      role: roleToUse,
    });
    return { success: true, data: notifications };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner', 'driver')
  @Sse('stream')
  @ApiOperation({
    summary: 'Stream notifications in real-time',
    description:
      'Establishes a Server-Sent Events (SSE) connection to receive real-time notification updates every 5 seconds. Only accessible by business owners and drivers.',
  })
  @ApiProduces('text/event-stream')
  @ApiResponse({
    status: 200,
    description: 'SSE stream established successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            notifications: {
              type: 'array',
              items: {
                type: 'object',
                description: 'Notification object',
              },
            },
            count: {
              type: 'number',
              description: 'Total number of notifications',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have required role',
  })
  streamNotifications(@Req() req: Request) {
    const userId = req.user.id; // Get from auth
    const role = req.user.role;

    return interval(5000).pipe(
      switchMap(() =>
        this.notificationService.getNotifications({ userId, role }),
      ),
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
  @ApiOperation({
    summary: 'Create a new notification',
    description:
      'Creates a new notification in the system. Only accessible by administrators.',
  })
  @ApiBody({
    type: CreateNotificationDto,
    description: 'Notification creation data',
    examples: {
      example1: {
        summary: 'Standard notification',
        value: {
          title: 'New Order Received',
          message: 'You have received a new delivery order',
          type: 'order',
          recipientId: 'user-123',
          priority: 'high',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Notification created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'success' },
        data: {
          type: 'object',
          description: 'Created notification object',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have admin role',
  })
  async createNotification(
    @Body() body: CreateNotificationDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: userId, role } = req.user;
    const notification = await this.notificationService.createNotification(
      body,
      userId,
      role,
    );

    res.status(HttpStatus.OK).json({ message: 'success', data: notification });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner', 'driver')
  @Patch('update-notification/:id')
  @ApiOperation({
    summary: 'Update a specific notification',
    description:
      'Updates an existing notification by ID. Only accessible by administrators.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Notification ID',
    example: 'notif-123',
  })
  @ApiBody({
    type: UpdateNotificationDto,
    description: 'Notification update data',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'success' },
        data: {
          type: 'object',
          description: 'Updated notification object',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have admin role',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Notification does not exist',
  })
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
  @Roles('admin', 'businessOwner', 'driver')
  @Post('update-notifications')
  @ApiOperation({
    summary: 'Update multiple notifications',
    description:
      'Updates multiple notifications at once using an array of notification IDs. Accessible by admins, business owners, and drivers.',
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data or query parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have required role',
  })
  async updateNotifications(
    @Body() body: UpdateNotificationsDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: userId } = req.user;

    const notification = await this.notificationService.updateNotifications(
      body,
      userId,
    );

    res.status(HttpStatus.OK).json({ message: 'success', data: notification });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'businessOwner', 'driver')
  @Get('dashboard-data')
  @ApiOperation({
    summary: 'Get notification dashboard data',
    description:
      'Retrieves aggregated notification statistics and summary data for the dashboard. Includes counts of unread, total, and categorized notifications.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have required role',
  })
  async notificationDashboard(@Req() req: Request, @Res() res: Response) {
    const { id: userId } = req.user;

    const notification =
      await this.notificationService.notificationDashboard(userId);

    res.status(HttpStatus.OK).json({ message: 'success', data: notification });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'businessOwner', 'driver')
  @Get('filter')
  async notificationFilters(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: FilterNotificationsDto,
  ) {
    const { id: userId } = req.user;

    const notification = await this.notificationService.filterNotifications(
      query,
      userId,
    );

    res.status(HttpStatus.OK).json({ message: 'success', data: notification });
  }
}
