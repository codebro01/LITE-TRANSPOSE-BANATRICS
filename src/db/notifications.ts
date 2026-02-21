import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  varchar,
  index,
} from 'drizzle-orm/pg-core';
import { userTable } from '@src/db/users';

export const statusType = pgEnum('notification_status_type', [
  'read',
  'unread',
]);
export const variantType = pgEnum('variant_type', [
  'info',
  'success',
  'warning',
  'danger',
]);

export const categoryType = pgEnum('category_type', ['payment', 'campaign']);

export const notificationTable = pgTable(
  'notifications',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('userId')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    message: text('message').notNull(),
    status: statusType('status').default('unread').notNull(),
    variant: variantType('variant').default('info').notNull(),
    role: varchar('role', { length: 50 }).notNull().default('businessOwner'),
    category: categoryType('category').notNull(),
    priority: text('priority').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    idx_notifications_role_userId: index('idx_notifications_role_userId').on(table.userId, table.role),
    idx_notifications_id_userId: index('idx_notifications_id_userId').on(table.userId, table.id),
    idx_notifications_userId: index('idx_notifications_userId').on(table.userId),
    idx_notifications_userId_status_category: index('idx_notifications_userId_status_category').on(table.userId, table.category, table.status),
    idx_notifications_userId_status: index('idx_notifications_userId_status').on(table.userId, table.status),
    idx_notifications_userId_category: index('idx_notifications_userId_category').on(table.userId, table.category),
  }),
);

export type notificationTableSelectType = typeof notificationTable.$inferSelect;
