import {
  pgTable,
  varchar,
  uuid,
  timestamp,
  boolean,
  doublePrecision,
} from 'drizzle-orm/pg-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const userTable = pgTable('users', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  phone: varchar('phone', { length: 50 }).notNull().unique(),
  role: varchar('role', { length: 50 }).array().default(['businessOwner']).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(), // can use date type if preferred
  password: varchar('password', { length: 255 }).notNull(),
  emailVerified: boolean('is_email_Verified').default(false).notNull(),
  passwordResetCode: varchar('password_reset_code'), 
  refreshToken: varchar('refreshToken', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const businessOwnerTable = pgTable('businessOwners', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  userId: uuid('userId').references(() => userTable.id, {onDelete: 'cascade'}),
  balance: doublePrecision('balance').default(0).notNull(),
  pending: doublePrecision('pending').default(0).notNull(),
  businessName: varchar('businessName', { length: 255 }).notNull(),
  businessAddress: varchar('businessAddress', { length: 255 }),
  businessLogo: varchar('businessLogo', { length: 255 }),
  refreshToken: varchar('refreshToken', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  // authProvider: varchar('authProvider', { length: 20 })
  //   .default('local')
  //   .notNull(),
});
export const driverTable = pgTable('drivers', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  userId: uuid('userId').references(() => userTable.id, {onDelete: 'cascade'}), // Add this line
  balance: doublePrecision('balance').default(0).notNull(),
  pending: doublePrecision('pending').default(0).notNull(),
  dp: varchar('dp', { length: 255 }),
  fullName: varchar('full_name', { length: 255 }).notNull().default('Null Driver'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  // authProvider: varchar('authProvider', { length: 20 })
  //   .default('local')
  //   .notNull(),
});

export type businessOwnerInsertType = InferInsertModel<
  typeof businessOwnerTable
>;
export type businessOwnerSelectType = InferSelectModel<
  typeof businessOwnerTable
>;
export type userInsertType = InferInsertModel<typeof userTable>;
export type userSelectType = InferSelectModel<typeof userTable>;
export type driverInsertType = InferInsertModel<typeof driverTable>;
export type driverSelectType = InferSelectModel<typeof driverTable>;
