import { campaignTable } from '@src/db/campaigns';
import { driverTable } from '@src/db/users';
import { index } from 'drizzle-orm/pg-core';
import { pgEnum } from 'drizzle-orm/pg-core';
import {
  pgTable,
  uuid,
  doublePrecision,
  varchar,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export enum PaymentStatusType {
  SUCCESS = 'success',
  REVERSED = 'reversed',
  FAILED = 'failed',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

export const approvalStatusType = pgEnum('approval_status_type', [
  'REJECTED',
  'APPROVED',
  'UNAPPROVED',
]);

export const earningsTable = pgTable(
  'earnings',
  {
    id: uuid('id').primaryKey().defaultRandom().notNull(),
    campaignId: uuid('campaignId').references(() => campaignTable.id, {
      onDelete: 'cascade',
    }),
    userId: uuid('userId').references(() => driverTable.userId, {
      onDelete: 'cascade',
    }),
    amount: doublePrecision('amount').notNull(),
    reference: text('reference'),
    dateInitiated: timestamp('date_initiated').defaultNow().notNull(),
    paymentMethod: text('payment_method').notNull().default('transfer'),
    recipientCode: varchar('recipient_code', { length: 255 }).notNull(),
    rejectionReason: varchar('rejection_reason', { length: 255 }),
    paymentStatus: text('payment_status')
      .$type<PaymentStatusType>()
      .notNull()
      .default(PaymentStatusType.PENDING),
    approved: approvalStatusType('approved').default('UNAPPROVED'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    idx_earnings_userId_approved: index('idx_earnings_userId_approved').on(
      table.userId,
      table.approved,
    ),
    idx_earnings_approved: index('idx_earnings_approved').on(
      table.approved,
    ),
    idx_earnings_userId: index('idx_earnings_userId').on(
      table.userId,
    ),
    idx_earnings_userId_updatedAt_approved: index('idx_earnings_userId_updatedAt_approved').on(
      table.userId,
      table.updatedAt, 
      table.approved
    ),
    idx_earnings_userId_approved_recipientCode: index('idx_earnings_userId_approved_recipientCode').on(
      table.userId,
      table.recipientCode, 
      table.approved
    ),
  }),
);

export type earningTableInsertType = typeof earningsTable.$inferInsert;
