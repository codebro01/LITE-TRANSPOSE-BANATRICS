import {
  pgTable,
  varchar,
  timestamp,
  integer,
  boolean,
  index,
  uuid
} from 'drizzle-orm/pg-core';
import { userTable } from '@src/db/users';
import { InferInsertModel } from 'drizzle-orm';
export const passwordResetTable = pgTable(
  'password_resets',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id')
      .references(() => userTable.id, { onDelete: 'cascade' }).unique(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    passwordResetCode: varchar('password_reset_code').notNull(),
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
    attempts: integer('attempts').notNull().default(0),
    used: boolean('used').notNull().default(false),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => ({
    emailCodeExpiresIdx: index('email_verification_code_epxps').on(
      table.email,
      table.expiresAt,
    ),
    emailCodeExpiresAtIdx: index('email_code_expires_at_idx').on(table.expiresAt),
  }),
);

export type PasswordResetInsertType = InferInsertModel<typeof passwordResetTable>
