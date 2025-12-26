import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { notificationTable } from '@src/db/notifications';
import { eq, and, inArray, sql, desc, SQL, } from 'drizzle-orm';
import { CreateNotificationDto } from '@src/notification/dto/createNotificationDto';
import { notificationTableSelectType } from '@src/db/notifications';
import { CatchErrorService } from '@src/catch-error/catch-error.service';
// import { UpdateNotificationDto } from '@src/notification/dto/updateNotificationDto';
import { FilterNotificationsDto } from '@src/notification/dto/filterNotificationDto';
import { StatusType } from '@src/notification/dto/updateNotificationDto';

@Injectable()
export class NotificationRepository {
  constructor(
    @Inject('DB') private DbProvider: NodePgDatabase<typeof import('@src/db')>,
    private catchErrorService: CatchErrorService,
  ) {}

  async createNotification(
    data: CreateNotificationDto,
    userId: string,
    trx?: typeof this.DbProvider,
  ) {
    const Trx = trx || this.DbProvider;
    try {
      const [notification] = await Trx.insert(notificationTable)
        .values({ ...data, userId })
        .returning();

      return notification;
    } catch (error) {
      console.log(error);
      this.catchErrorService.catch(error, 'an error occured creating campaign');
    }
  }

  async getNotifications(
    userId: string,
  ): Promise<notificationTableSelectType[]> {
    const notifications = await this.DbProvider.select()
      .from(notificationTable)
      .where(eq(notificationTable.userId, userId))
      .orderBy(desc(notificationTable.createdAt));

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

  async updateNotifications(
    data: {status: StatusType},
    notificationId: string[],
    userId: string,
  ): Promise<notificationTableSelectType[]> {
    const notifications = await this.DbProvider.update(notificationTable)
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

  async notificationDashboard(userId: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [stats] = await this.DbProvider.select({
      unread: sql<number>`COUNT(CASE WHEN ${notificationTable.status} = 'unread' THEN 1 END)`,
      important: sql<number>`COUNT(CASE WHEN ${notificationTable.priority} = 'important' THEN 1 END)`,
      thisWeek: sql<number>`COUNT(CASE WHEN ${notificationTable.createdAt} >= ${sevenDaysAgo} THEN 1 END)`,
    })
      .from(notificationTable)
      .where(eq(notificationTable.userId, userId));

    return {
      unread: stats.unread,
      important: stats.important,
      thisWeek: stats.thisWeek,
    };
  }

  async filterNotifications(filters: FilterNotificationsDto, userId: string) {
    const conditions: SQL[] = [eq(notificationTable.userId, userId)];
    console.log(filters)
    if (filters.unread) {
      conditions.push(eq(notificationTable.status, 'unread'));
    }
    if (filters.unread === false) {
      conditions.push(eq(notificationTable.status, 'read'));
    }
    if (filters.campaign) {
      conditions.push(eq(notificationTable.category, 'campaign'));
    }
    if (filters.payment) {
      conditions.push(eq(notificationTable.category, 'payment'));
    }

    return await this.DbProvider.select()
      .from(notificationTable)
      .where(and(...conditions))
      .orderBy(desc(notificationTable.createdAt));
  }

  //   ! admin will be able to send general notifications to all business owners and also all drivers
}
