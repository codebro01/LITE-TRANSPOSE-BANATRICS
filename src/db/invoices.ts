import { pgTable, uuid, doublePrecision, timestamp, varchar } from "drizzle-orm/pg-core";
import { campaignTable } from "@src/db/campaigns";
import { driverTable } from "@src/db/users";


export enum InvoiceStatusType {
  SUCCESS = 'success',
  PENDING = 'pending',
  OVERDUE = 'overdue',
  FAILED = 'failed',
}

export const invoicesTable = pgTable('invoices', {
      id: uuid('id').primaryKey().defaultRandom().notNull(), 
      campaignId: uuid('campaignId').references(() => campaignTable.id, {
        onDelete: 'cascade',
      }),
      userId: uuid('userId').references(() => driverTable.userId, {
        onDelete: 'cascade',
      }),
      status: varchar('status', {length: 100}).$type<InvoiceStatusType>().default(InvoiceStatusType.PENDING), 
      amount: doublePrecision('amount').notNull(),
      dueDate: timestamp('due_date').defaultNow().notNull(),
      invoiceId: varchar('invoice_id', {length: 50}).notNull(), 
      date: timestamp('date', {withTimezone: true}).defaultNow().notNull(),
     createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
       updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export type invoicesInsertType = typeof invoicesTable.$inferInsert;