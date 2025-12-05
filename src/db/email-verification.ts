import {
  pgTable,
  varchar,
  timestamp,
  integer,
  boolean,
  index,
  uuid
} from 'drizzle-orm/pg-core';
import { InferInsertModel } from 'drizzle-orm';
export const emailVerificationTable = pgTable(
  'email_verifications',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    phone: varchar('phone', { length: 255 }).notNull().unique(), 
          nin: varchar('nin', { length: 255 }),
    emailVerificationCode: varchar('email_verification_code').notNull(),
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
    attempts: integer('attempts').notNull().default(0),
    used: boolean('used').notNull().default(false),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => ({
    emailExpiresIdx: index('email_expires_idx').on(
      table.email,
      table.expiresAt,
    ),
    expiresAtIdx: index('expires_at_idx').on(table.expiresAt),
  }),
);

export type EmailVerificationInsertType = InferInsertModel<typeof emailVerificationTable>
