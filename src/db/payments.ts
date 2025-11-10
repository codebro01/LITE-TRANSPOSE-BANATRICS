import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  integer,
} from 'drizzle-orm/pg-core';
import { userTable } from '@src/db/users';

export const PaymentStatusType = pgEnum('payment_status_type', [
  'pending',
  'completed',
]);
export const PaymentMethodType = pgEnum('payment_method', ['card', 'transfer']);

export const paymentTable = pgTable('payments', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => userTable.id),
  invoiceId: text('invoice_id'),
  campaignName: text('campaign_name').notNull(),
  amount: integer('amount').notNull(),
  paymentMethod: PaymentMethodType('payment_method').notNull(),
  paymentStatus: PaymentStatusType('payment_status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type paymentInsertType = typeof paymentTable.$inferInsert;
export type paymentSelectType = typeof paymentTable.$inferSelect;
