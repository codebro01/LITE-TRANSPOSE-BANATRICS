import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { notificationTable } from '@src/db/notifications';
import { eq, and, inArray } from 'drizzle-orm';
import { CreateNotificationDto } from '@src/notification/dto/createNotificationDto';
import { notificationTableSelectType } from '@src/db/notifications';
import { CatchErrorService } from '@src/catch-error/catch-error.service';

@Injectable()
export class NotificationRepository {
  constructor(
    @Inject('DB') private DbProvider: NodePgDatabase<typeof import('@src/db')
    >,
    private catchErrorService: CatchErrorService,
  ) {}

  async createNotification(data: CreateNotificationDto, userId: string) {
    try {
      const [notification] = await this.DbProvider.insert(notificationTable)
        .values({ ...data, userId })
        .returning();

      return notification;
    } catch (error) {
        console.log(error)
      this.catchErrorService.catch(error, 'an error occured creating campaign');
    }
  }

  async getNotifications(userId: string): Promise<notificationTableSelectType> {
    const [notifications] = await this.DbProvider.select()
      .from(notificationTable)
      .where(eq(notificationTable.userId, userId));

    return notifications;
  }

  async getNotification(
    notificationId: string,
    userId: string,
  ): Promise<notificationTableSelectType> {
    const [notifications] = await this.DbProvider.select()
      .from(notificationTable)
      .where(
        and(
          eq(notificationTable.userId, userId),
          eq(notificationTable.id, notificationId),
        ),
      );

    return notifications;
  }

  async updateNotification(
    data: Pick<CreateNotificationDto, 'status'>,
    notificationId: string,
    userId: string,
  ): Promise<notificationTableSelectType> {
    const [notifications] = await this.DbProvider.update(notificationTable)
      .set(data)
      .where(
        and(
          eq(notificationTable.userId, userId),
          eq(notificationTable.id, notificationId),
        ),
      )
      .returning();

    return notifications;
  }

  async updateManyNotifications(
    data: Pick<CreateNotificationDto, 'status'>,
    notificationId: string[],
    userId: string,
  ): Promise<notificationTableSelectType> {
    const [notifications] = await this.DbProvider.update(notificationTable)
      .set(data)
      .where(
        and(
          eq(notificationTable.userId, userId),
          inArray(notificationTable.id, notificationId),
        ),
      )
      .returning();

    return notifications;
  }

  //   ! admin will be able to send general notifications to all business owners and also all drivers
}
