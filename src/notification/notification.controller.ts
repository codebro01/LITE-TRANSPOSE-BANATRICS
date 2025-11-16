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
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiProduces,
} from '@nestjs/swagger';

@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

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
    examples: {
      example1: {
        summary: 'Mark as read',
        value: {
          isRead: true,
        },
      },
      example2: {
        summary: 'Update message',
        value: {
          message: 'Updated notification message',
          priority: 'medium',
        },
      },
    },
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
  @Roles('admin, businessOwner, driver')
  @Post('update-notifications')
  @ApiOperation({
    summary: 'Update multiple notifications',
    description:
      'Updates multiple notifications at once using an array of notification IDs. Accessible by admins, business owners, and drivers.',
  })
  @ApiQuery({
    name: 'ids',
    type: String,
    description: 'Comma-separated list of notification IDs',
    example: 'notif-123,notif-456,notif-789',
    required: true,
  })
  @ApiBody({
    type: UpdateNotificationDto,
    description: 'Update data to apply to all specified notifications',
    examples: {
      example1: {
        summary: 'Mark multiple as read',
        value: {
          isRead: true,
        },
      },
      example2: {
        summary: 'Archive multiple notifications',
        value: {
          isArchived: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'success' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            description: 'Updated notification objects',
          },
        },
      },
    },
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
    @Body() body: UpdateNotificationDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('ids') query: UpdateNotificationsQueryDto,
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
  @ApiOperation({
    summary: 'Get notification dashboard data',
    description:
      'Retrieves aggregated notification statistics and summary data for the dashboard. Includes counts of unread, total, and categorized notifications.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'success' },
        data: {
          type: 'object',
          properties: {
            totalNotifications: {
              type: 'number',
              example: 150,
            },
            unreadCount: {
              type: 'number',
              example: 12,
            },
            readCount: {
              type: 'number',
              example: 138,
            },
            byType: {
              type: 'object',
              description: 'Notifications grouped by type',
            },
            recentNotifications: {
              type: 'array',
              items: {
                type: 'object',
              },
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
