import { campaignTable } from "@src/db/campaigns";
import { userTable } from "@src/db/users";
import { pgTable, boolean,  timestamp,  pgEnum,  uuid } from "drizzle-orm/pg-core";

export const driverCampaignStatusType = pgEnum('driver_campaign_status_type', [ 'completed', 'pending_approval', 'due_soon', 'approved', 'rejected'])

export const driverCampaignTable = pgTable('driver_campaigns', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  userId: uuid('userId')
    .references(() => userTable.id, { onDelete: 'cascade' })
    .notNull(),
  campaignId: uuid('campaignId')
    .references(() => campaignTable.id, { onDelete: 'cascade' })
    .notNull(),
  campaignStatus:
    driverCampaignStatusType('campaign_status').default('pending_approval'),
  paid: boolean('payment_status').default(false),
  active: boolean('active_status').default(false),
  startDate: timestamp('start_date', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),

  // startDate: timestamp('start_date'),
});