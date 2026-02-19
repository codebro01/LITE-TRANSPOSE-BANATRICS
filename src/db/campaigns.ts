// db/schema/campaign.schema.ts
import {
  pgTable,
  varchar,
  integer,
  timestamp,
  text,
  pgEnum,
  uuid,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core';
import { userTable } from '@src/db/users';
import { relations } from 'drizzle-orm';
import { weeklyProofTable } from '@src/db/weekly_proofs';
import { campaignDesignsTable } from '@src/db/campaign-designs';

// Package type enum
export const campaignPackageTypeEnum = pgEnum('package_type', [
  'starter',
  'basic',
  'premium',
  'custom',
  'grand',
]);

export const maintenanceTypeEnum = pgEnum('maintenance_type', [
  'basic',
  'standard',
  'premium',
]);
export const paymentStatusEnum = pgEnum('payment_status', ['spent', 'pending']);
export const campaignStatusType = pgEnum('campaign_status_type', [
  'draft', //! this is the stutus when the business Owner decides to save the campaign as draft
  'pending', //! this is the stutus when the campaign of business Owner is approved and still active
  'approved', //! this is the stutus before approval
  'completed', //! this is the stutus when the campaign is completed
  'rejected',
]);

export const campaignTable = pgTable('campaigns', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  packageType: campaignPackageTypeEnum('package_type'),
  statusType: campaignStatusType('status_type'),
  paymentStatus: boolean('payment_status').default(false).notNull(),
  duration: integer('duration').default(30).notNull(),
  revisions: varchar('revisions'),
  maintenanceType: maintenanceTypeEnum('maintenance_type'),
  lgaCoverage: varchar('lga_coverage', { length: 10 }),
  price: integer('price'),
  noOfDrivers: integer('no_of_drivers'),
  availability: integer('availability'),
  campaignName: varchar('campaign_name', { length: 255 }),
  campaignDescriptions: text('campaign_descriptions'),
  startDate: timestamp('start_date', { mode: 'date', withTimezone: true }),
  endDate: timestamp('end_date', { mode: 'date', withTimezone: true }),
  companyLogo: jsonb('company_logo').$type<{
    secure_url: string;
    public_id: string;
  }>(), // URL to uploaded logo
  state: varchar('state', { length: 100 }),
  bannerDetails: jsonb('banner_details').$type<{
    url: {
      secure_url: string;
      public_id: string;
    };
    printHouse: string;
    address: string;
  }>(),
  earningPerDriver: integer('earning_per_driver'),
  colorPallete: varchar('color_pallete').array(),
  callToAction: text('call_to_action'),
  requirements: text('requirements'),
  mainMessage: text('main_message'),
  active: boolean('active').default(false),
  responseOnSeeingBanner: text('response_on_seeing_banner'),
  uploadedImages: jsonb('uploaded_images')
    .$type<{ secure_url: string; public_id: string }[]>()
    .default([]),

  slogan: varchar('slogan', { length: 500 }),
  printHousePhoneNo: varchar('print_house_phone_no', { length: 20 }),
  spentAt: timestamp('spent_at', { mode: 'date', withTimezone: true }),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
});


export const campaignRelations = relations(campaignTable, ({ many }) => ({
  weeklyProofs: many(weeklyProofTable),
  campaignDesigns: many(campaignDesignsTable),
}));

export const campaignDesignsRelations = relations(
  campaignDesignsTable,
  ({ one }) => ({
    campaign: one(campaignTable, {
      fields: [campaignDesignsTable.campaignId],
      references: [campaignTable.id],
    }),
  }),
);

export const weeklyProofRelations = relations(weeklyProofTable, ({ one }) => ({
  campaign: one(campaignTable, {
    fields: [weeklyProofTable.campaignId],
    references: [campaignTable.id],
  }),
}));




export type campaignInsertType = typeof campaignTable.$inferInsert;
export type campaignSelectType = typeof campaignTable.$inferSelect;
