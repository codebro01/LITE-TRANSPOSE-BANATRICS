import { pgTable, text, timestamp, uuid, pgEnum } from 'drizzle-orm/pg-core';
import { userTable } from '@src/db/users';

export const statusType = pgEnum('notification_status_type', [
    'read', 
    'unread'
])
export const variantType = pgEnum('variant_type', ['info', 'success', 'warning', 'danger']);


export const categoryType = pgEnum('category_type', ['payment', 'campaign']);

export const notificationTable = pgTable('notifications', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => userTable.id),
  title: text('title').notNull(),
  message: text('message').notNull(),
  status: statusType('status').default('unread').notNull(),
  variant: variantType('variant').default('info').notNull(),
  category: categoryType('category').notNull(),
  priority: text('priority').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type notificationTableSelectType = typeof notificationTable.$inferSelect;
