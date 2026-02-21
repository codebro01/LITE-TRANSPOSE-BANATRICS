import {
  pgTable,
  varchar,
  timestamp,
  integer,
  boolean,
  index,
  uuid,
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
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    attempts: integer('attempts').notNull().default(0),
    used: boolean('used').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    emailExpiresIdx: index('email_expires_idx').on(
      table.email,
      table.expiresAt,
    ),
    expiresAtIdx: index('expires_at_idx').on(table.expiresAt),
    idx_emailVerification_email: index('idx_emailVerification_email').on(
      table.email,
    ),
    idx_emailVerification_email_used: index('idx_emailVerification_email_used').on(
      table.email,
      table.used,
    ),
  }),
);

export type EmailVerificationInsertType = InferInsertModel<
  typeof emailVerificationTable
>;
