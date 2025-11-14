import { Injectable, Inject } from "@nestjs/common";
import { DbProvider } from "@src/db/provider";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { notificationTable } from "@src/db/notifications";


@Injectable() 

export class NotificationRepository {
    constructor(@Inject('DB') private DbProvider : NodePgDatabase<typeof import('@src/db')>) {}


    async createNotification(data) {
       const [notification] =
         await this.DbProvider.insert(notificationTable).values(
           data,
         ).returning();
    }

}