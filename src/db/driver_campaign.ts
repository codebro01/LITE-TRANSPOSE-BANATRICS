import { campaignTable } from "@src/db/campaigns";
import { userTable } from "@src/db/users";
import { pgTable, pgEnum,  uuid } from "drizzle-orm/pg-core";

export const driverCampaignStatusType = pgEnum('driver_campaign_status_type', ['active', 'completed', 'pending_approval', 'due_soon', 'approved'])

export const driverCampaignTable = pgTable('driver_campaigns', {
    id: uuid('id').defaultRandom().primaryKey().notNull(), 
    userId: uuid('userId').references(() => userTable.id, {onDelete:"cascade"}).notNull(), 
    campaignId: uuid('campaignId').references(() => campaignTable.id, {onDelete: 'cascade'}), 
    campaignStatus: driverCampaignStatusType('campaign_status').default('pending_approval'), 
    // startDate: timestamp('start_date'), 
})