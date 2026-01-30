import {
  pgTable,
  text,
  timestamp,
  uuid,
  doublePrecision
} from 'drizzle-orm/pg-core';
import { userTable } from '@src/db/users';



export enum PaymentStatusType {
  SUCCESS = 'success',
  REVERSED = 'reversed',
  FAILED = 'failed', 
  PENDING = 'pending',
  CANCELLED = 'cancelled', 
}

export const paymentTable = pgTable('payments', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => userTable.id),
  invoiceId: text('invoice_id'),
  reference: text('reference'),
  dateInitiated: timestamp('date_initiated', {withTimezone: true}).defaultNow(),
  amount: doublePrecision('amount').notNull(),
  paymentMethod: text('payment_method').notNull(),
  paymentStatus: text('payment_status')
    .$type<PaymentStatusType>()
    .notNull(),
createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export type paymentInsertType = typeof paymentTable.$inferInsert;
export type paymentSelectType = typeof paymentTable.$inferSelect;
