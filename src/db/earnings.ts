import { campaignTable } from '@src/db/campaigns';
import {
  pgTable,
  uuid,
  doublePrecision,
  varchar,
  text,
  timestamp, 
} from 'drizzle-orm/pg-core';

export const earningsTable = pgTable('earnings', {
  campaignId: uuid('campaignId').references(() => campaignTable.id, {
    onDelete: 'cascade',
  }),
  amount: doublePrecision('amount').notNull(),
  reference: text('reference'),
  dateInitiated: text('date_initiated'),
  paymentMethod: text('payment_method').notNull(),
  recipientCode: varchar('recipient_code', {length: 255}).notNull(),
  paymentStatus: text('payment_status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


export type earningTableInsertType = typeof earningsTable.$inferInsert
