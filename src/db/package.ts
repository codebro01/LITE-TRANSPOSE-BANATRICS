import {
  varchar,
  uuid,
  timestamp,
  pgTable,
  integer
} from 'drizzle-orm/pg-core';
import { userTable } from './users';
import { packageTypeEnum } from '@src/db/campaigns'; 
import { maintenanceTypeEnum } from '@src/db/campaigns';


export const packageTable = pgTable('packages', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  userId: uuid('adminId').references(() => userTable.id, {
    onDelete: 'cascade',
  }).notNull(),
  packageType: packageTypeEnum('package_type').notNull(), 
  maintenanceType: maintenanceTypeEnum('maintenance_type').notNull(), 
  duration: integer('duration').notNull(),
  revisions: varchar('revisions').notNull(),
  price: integer('price').notNull(),
  lgaCoverage: varchar('lga_coverage', {length: 10}).notNull(),
  noOfDrivers: integer('no_of_drivers').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
