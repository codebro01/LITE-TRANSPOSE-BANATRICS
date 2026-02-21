import {
  pgTable,
  varchar,
  timestamp,
  integer,
  boolean,
  index,
  uuid,
} from 'drizzle-orm/pg-core';
import { userTable } from '@src/db/users';
import { InferInsertModel } from 'drizzle-orm';
export const passwordResetTable = pgTable(
  'password_resets',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id')
      .references(() => userTable.id, { onDelete: 'cascade' })
      .unique(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    passwordResetCode: varchar('password_reset_code').notNull(),
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
    attempts: integer('attempts').notNull().default(0),
    used: boolean('used').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    emailCodeExpiresIdx: index('email_verification_code_epxps').on(
      table.email,
      table.expiresAt,
    ),
    emailCodeExpiresAtIdx: index('email_code_expires_at_idx').on(
      table.expiresAt,
    ),
    idx_passwordReset_email: index('idx_passwordReset_email').on(
      table.email,
    ),
    idx_passwordReset_email_used: index('idx_passwordReset_email_used').on(
      table.email,
      table.used,
    ),
    idx_passwordReset_userId: index('idx_passwordReset_userId').on(
      table.userId,
    ),
  }),
);

export type PasswordResetInsertType = InferInsertModel<
  typeof passwordResetTable
>;
