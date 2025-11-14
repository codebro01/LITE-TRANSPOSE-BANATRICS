import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '@src/notification/repository/notification.repository';
import { CreateNotificationDto } from '@src/notification/dto/createNotificationDto';
import { notificationTableSelectType } from '@src/db/notifications';
import { CatchErrorService } from '@src/catch-error/catch-error.service';

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
}
