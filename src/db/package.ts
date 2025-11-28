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
  }),
  packageType: packageTypeEnum('package_type').notNull(), 
  maintenanceType: maintenanceTypeEnum('maintenance_type').notNull(), 
  duration: integer('duration'),
  revisions: varchar('revisions'),
  price: integer('price'),
  lgaCoverage: varchar('lga_coverage', {length: 10}),
  noOfDrivers: integer('no_of_drivers'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
