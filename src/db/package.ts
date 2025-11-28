import {
  varchar,
  uuid,
  timestamp,
  pgTable,
  integer
} from 'drizzle-orm/pg-core';
import { userTable } from './users';

export const packageTable = pgTable('packages', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  userId: uuid('adminId').references(() => userTable.id, {
    onDelete: 'cascade',
  }),
  duration: integer('duration'),
  revisions: varchar('revisions'),
  price: integer('price'),
  lgaCoverage: varchar('lga_coverage', {length: 10}),
  noOfDrivers: integer('no_of_drivers'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
