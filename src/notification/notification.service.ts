import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '@src/notification/repository/notification.repository';
import {
  CreateNotificationDto,
  StatusType,
} from '@src/notification/dto/createNotificationDto';
// import { notificationTableSelectType } from '@src/db/notifications';
import { CatchErrorService } from '@src/catch-error/catch-error.service';
import { FilterNotificationsDto } from './dto/filterNotificationDto';

@Injectable()
export class NotificationService {
  constructor(
    private notificationRepository: NotificationRepository,
    private catchErrorService: CatchErrorService,
  ) {}

  async createNotification(data: CreateNotificationDto, userId: string) {
    try {
      const notification = await this.notificationRepository.createNotification(
        data,
        userId,
      );

      return notification;
    } catch (error) {
      this.catchErrorService.catch(
        error,
        'An error occured trying to create notification',
      );
    }
  }

  async getNotifications(userId: string) {
    try {
      const notification =
        await this.notificationRepository.getNotifications(userId);

      return notification;
    } catch (error) {
      this.catchErrorService.catch(
        error,
        'An error occured trying to create notification',
      );
    }
  }

  async getNotification(notificationId: string, userId: string) {
    try {
      const notification = await this.notificationRepository.getNotification(
        notificationId,
        userId,
      );

      return notification;
    } catch (error) {
      this.catchErrorService.catch(
        error,
        'An error occured trying to create notification',
      );
    }
  }
  async updateNotifications(
    data: { status: StatusType; ids: string[] },
    userId: string,
  ) {
    try {
      const notification =
        await this.notificationRepository.updateNotifications(
          {status: data.status},
          data.ids,
          userId,
        );

      return notification;
    } catch (error) {
      this.catchErrorService.catch(
        error,
        'An error occured trying to create notification',
      );
    }
  }
  async updateNotification(
    data: Pick<CreateNotificationDto, 'status'>,
    notificationId: string,
    userId: string,
  ) {
    try {
      const notification = await this.notificationRepository.updateNotification(
        data,
        notificationId,
        userId,
      );

      return notification;
    } catch (error) {
      this.catchErrorService.catch(
        error,
        'An error occured trying to create notification',
      );
    }
  }
  async notificationDashboard(userId: string) {
    try {
      const data =
        await this.notificationRepository.notificationDashboard(userId);

      return data;
    } catch (error) {
      this.catchErrorService.catch(
        error,
        'An error occured trying to create notification',
      );
    }
  }

  async filterNotifications(filters: FilterNotificationsDto, userId: string) {
    const data = await this.notificationRepository.filterNotifications(
      filters,
      userId,
    );
    return data;
  }
}
