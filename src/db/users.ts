import {
  pgTable,
  varchar,
  uuid,
  timestamp,
  boolean,
  doublePrecision,
} from 'drizzle-orm/pg-core';
import { jsonb } from 'drizzle-orm/pg-core';

export const userTable = pgTable('users', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  phone: varchar('phone', { length: 50 }).notNull().unique(),
  role: varchar('role', { length: 50 })
    .array()
    .default(['businessOwner'])
    .notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(), // can use date type if preferred
  password: varchar('password', { length: 255 }).notNull(),
  emailVerified: boolean('is_email_Verified').default(false).notNull(),
  refreshToken: varchar('refreshToken', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const businessOwnerTable = pgTable('businessOwners', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  userId: uuid('userId').references(() => userTable.id, {
    onDelete: 'cascade',
  }).unique().notNull(),
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
  userId: uuid('userId').references(() => userTable.id, {
    onDelete: 'cascade',
  }).unique().notNull(), 
  fullName: varchar('full_name', { length: 255 })
    .notNull()
    .default('Null Driver'),
  approvedStatus: boolean('approved_status').default(false).notNull(), 
  balance: doublePrecision('balance').default(0).notNull(),
  pending: doublePrecision('pending').default(0).notNull(),
  dp: varchar('dp', { length: 255 }),
  nin: varchar('nin', { length: 12 }).notNull().unique(),
  state: varchar('state', { length: 50 }).notNull(),
  lga: varchar('lga', { length: 50 }).notNull(),
  frontview: jsonb('frontview')
    .$type<{
      secure_url: string;
      public_id: string;
    }>()
    .notNull(),
  backview: jsonb('backview')
    .$type<{
      secure_url: string;
      public_id: string;
    }>()
    .notNull(),
  sideview: jsonb('sideview')
    .$type<{
      secure_url: string;
      public_id: string;
    }>()
    .notNull(),
  driverLicense: jsonb('driver_license').$type<{
    secure_url: string;
    public_id: string;
  }>(),
  owershipDocument: jsonb('ownership_document').$type<{
    secure_url: string;
    public_id: string;
  }>(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  // authProvider: varchar('authProvider', { length: 20 })
  //   .default('local')
  //   .notNull(),
});

export type businessOwnerInsertType = typeof businessOwnerTable.$inferInsert;
export type businessOwnerSelectType = typeof businessOwnerTable.$inferSelect;
export type userInsertType = typeof userTable.$inferInsert;
export type userSelectType = typeof userTable.$inferSelect;
export type driverInsertType = typeof driverTable.$inferInsert;
export type driverSelectType = typeof driverTable.$inferSelect;
