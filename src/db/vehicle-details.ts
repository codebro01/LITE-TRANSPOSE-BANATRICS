import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { driverTable } from '@src/db/users';
import { jsonb } from 'drizzle-orm/pg-core';

export const vehicleDetailsTable = pgTable('vehicle_details', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => driverTable.userId, {onDelete: "cascade"}).unique().notNull(),
  plateNumber: varchar('plate_number', { length: 255 }),
  color: varchar('color', { length: 50 }).notNull(),
  state: varchar('state', { length: 50 }).notNull(),
  lga: varchar('lga', { length: 50 }).notNull(),
  vehiclePhotos: jsonb('vehicle_photos').$type<{
    secure_url: string, 
    public_id: string, 
  }>().array().notNull(), 
  yearOfManufacture: varchar('year_of_manufacture', { length: 6 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


export type vehicleDetailsInsertType = typeof vehicleDetailsTable.$inferInsert;