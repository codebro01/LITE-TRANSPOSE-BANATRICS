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
  email: varchar('email').notNull(),
  amount: doublePrecision('amount').notNull(),
  month: varchar('month', { length: 255 }).notNull(),
  invoiceId: text('invoice_id'),
  reference: text('reference'),
  dateInitiated: text('date_initiated'),
  paymentMethod: text('payment_method').notNull(),
  paymentStatus: text('payment_status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
