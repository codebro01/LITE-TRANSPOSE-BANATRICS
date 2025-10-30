// db/schema/campaign.schema.ts
import {
  pgTable,
  varchar,
  integer,
  timestamp,
  text,
  pgEnum,
  uuid,
} from 'drizzle-orm/pg-core';
import { userTable } from '@src/db/users';

// Package type enum
export const packageTypeEnum = pgEnum('package_type', [
  'starter',
  'basic',
  'premium',
  'custom',
]);
export const statusTypeEnum = pgEnum('status_type', [
  'draft', //! this is the stutus when the business Owner decides to save the campaign as draft
  'active', //! this is the stutus when the campaign of business Owner is approved and still active
  'pending', //! this is the stutus before approval
  'completed', //! this is the stutus when the campaign is completed
]);

export const campaignTable = pgTable('campaigns', {
  id: uuid().defaultRandom().primaryKey().notNull(),

  // Required fields
  packageType: packageTypeEnum('package_type'),
  statusType: statusTypeEnum('status_type'),
  duration: varchar('duration'),
  revisions: varchar('revisions'),
  price: integer('price'),
  noOfDrivers: integer('no_of_drivers'),
  campaignName: varchar('campaign_name', { length: 255 }),
  campaignDescriptions: text('campaign_descriptions'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  companyLogo: varchar('company_logo'), // URL to uploaded logo
  colorPallete: varchar('color_pallete'),
  callToAction: varchar('call_to_action'),
  mainMessage: text('main_message'),
  responseOnSeeingBanner: text('response_on_seeing_banner'),
  uploadMediaFiles: text('upload_media_files').array(), // Array of strings

  // Optional field
  slogan: varchar('slogan', { length: 500 }),

  // Foreign key (if campaigns belong to users)
  userId: varchar('user_id')
    .notNull()
    .references(() => userTable.id),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Types
export type campaignInsertType = typeof campaignTable.$inferInsert;
export type campaignSelectType = typeof campaignTable.$inferSelect;
