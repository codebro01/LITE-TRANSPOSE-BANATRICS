import { userTable } from '@src/db/users';
import { pgTable, varchar, integer, uuid } from 'drizzle-orm/pg-core';

export const bankDetailsTable = pgTable('bank_details', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  userId: uuid('userId')
    .references(() => userTable.id)
    .notNull(),
  accountNumber: varchar('account_number', { length: 10 }).notNull(),
  accountName: varchar('account_name', { length: 255 }).notNull(),
  bankId: integer('bankId').notNull(),
  bankCode: integer('bank_code').notNull(),
  recipientCode: varchar('transfer_recipient_code', {
    length: 255,
  }).notNull(),
});

export type bankDetailsInsertType = typeof bankDetailsTable.$inferInsert;
