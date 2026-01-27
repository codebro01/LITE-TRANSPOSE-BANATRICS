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
  dateInitiated: text('date_initiated'),
  amount: doublePrecision('amount').notNull(),
  paymentMethod: text('payment_method').notNull(),
  paymentStatus: text('payment_status')
    .$type<PaymentStatusType>()
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type paymentInsertType = typeof paymentTable.$inferInsert;
export type paymentSelectType = typeof paymentTable.$inferSelect;
