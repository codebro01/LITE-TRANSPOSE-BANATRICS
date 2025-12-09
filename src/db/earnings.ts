import { campaignTable } from '@src/db/campaigns';
import { driverTable } from '@src/db/users';
import { pgEnum } from 'drizzle-orm/pg-core';
import {
  pgTable,
  uuid,
  doublePrecision,
  varchar,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const approvalStatusType = pgEnum('approval_status_type', ['REJECTED', 'APPROVED', 'UNAPPROVED'])

export const earningsTable = pgTable('earnings', {
  campaignId: uuid('campaignId').references(() => campaignTable.id, {
    onDelete: 'cascade',
  }),
  userId: uuid('userId').references(() => driverTable.userId, {
    onDelete: 'cascade',
  }),
  amount: doublePrecision('amount').notNull(),
  reference: text('reference'),
  dateInitiated: text('date_initiated'),
  paymentMethod: text('payment_method').notNull(),
  recipientCode: varchar('recipient_code', { length: 255 }).notNull(),
  rejectionReason: varchar('rejection_reason', { length: 255 }),
  paymentStatus: text('payment_status').notNull(),
  approved: approvalStatusType('approved').default('UNAPPROVED'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


export type earningTableInsertType = typeof earningsTable.$inferInsert
