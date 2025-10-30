import {
  pgTable,
  varchar,
  uuid,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const userTable = pgTable('users', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  role: varchar('role', { length: 50 }).default('driver').notNull(),
  email: varchar('email', { length: 255 }).notNull(), // can use date type if preferred
  password: varchar('password', { length: 255 }).notNull(),
  emailVerified: boolean('is_email_Verified').default(false).notNull(),
  refreshToken: varchar('refreshToken', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),

});

export const businessOwnerTable = pgTable('businessOwners', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  userId: uuid('user_id')
    .references(() => userTable.id), 
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
  userId: uuid('user_id').references(() => userTable.id), // Add this line
  role: varchar('role', { length: 10 }).default('user').notNull(),
  fullName: varchar('fullName', { length: 255 }).notNull(),
  refreshToken: varchar('refreshToken', { length: 255 }),
  dp: varchar('dp', { length: 255 }),
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
