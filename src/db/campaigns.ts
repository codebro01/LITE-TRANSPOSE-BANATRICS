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
import { index } from 'drizzle-orm/pg-core';

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

export const campaignTable = pgTable(
  'campaigns',
  {
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
  },
  (table) => ({
    campaignsUserIdIdx: index('campaign_user_id_idx').on(table.userId),
    campaignsIdUserIdIdx: index('campaign_id_user_id_idx').on(table.userId, table.id),
    campaignsUserIdStatusIdx: index('campaign_drafts_by_id_idx').on(
      table.userId,
      table.statusType,
    ),
    campaignsStatusIdx: index('campaigns_status_idx').on(table.statusType),
    campaignPaymentStatusActiveIdx: index('campaigns_payment_status_active_idx').on(
      table.id,
      table.statusType,
      table.active,
    ),
    campaignStatusActiveIdx: index('campaigns_status_active_idx').on(
      table.statusType,
      table.active,
    ),
    idx_campaign_status_payment: index('idx_campaign_status_payment').on(
      table.statusType,
      table.paymentStatus,
    ),
    idx_campaign_status_payment_userId: index('idx_campaign_status_payment_userId').on(
      table.userId,
      table.statusType,
      table.paymentStatus,
    ),
    idx_campaign_userId_paymentStatus_spentAt: index('idx_campaign_userId_paymentStatus_spentAt').on(
      table.userId,
      table.paymentStatus,
      table.spentAt,
    ),
    idx_campaign_active_payment : index('idx_campaign_active_payment ').on(
      table.active,
      table.paymentStatus,
    ),
    idx_campaign_id_userId : index('idx_campaign_id_userId ').on(
      table.id,
      table.userId,
    ),
  }),
);

export type campaignInsertType = typeof campaignTable.$inferInsert;
export type campaignSelectType = typeof campaignTable.$inferSelect;
