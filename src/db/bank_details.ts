import { userTable } from '@src/db/users';
import { pgTable, varchar, integer, uuid } from 'drizzle-orm/pg-core';

export const bankDetailsTable = pgTable('bank_details', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  userId: uuid('userId')
    .references(() => userTable.id)
    .notNull().unique(),
  accountNumber: varchar('account_number', { length: 10 }).notNull(),
  accountName: varchar('account_name', { length: 255 }).notNull(),
  bankName: varchar('bank_name', { length: 255 }),
  bankId: integer('bankId').notNull(),
  bankCode: varchar('bank_code', {length: 10}).notNull(),
  recipientCode: varchar('transfer_recipient_code', {
    length: 255,
  }).notNull().unique(),
});

export type bankDetailsInsertType = typeof bankDetailsTable.$inferInsert;
