import { campaignTable } from "@src/db/campaigns";
import { index } from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";
import { pgTable, timestamp, uuid, jsonb, text } from 'drizzle-orm/pg-core';

export const designApprovalStatusType = pgEnum('design_approval_status_type', ['pending', 'approved', 'rejected'])


export const campaignDesignsTable = pgTable('campaign_designs', {
    id: uuid('id').defaultRandom().primaryKey().notNull(), 
    campaignId: uuid('campaignId').references(() => campaignTable.id, {onDelete: 'cascade'}).notNull(), 
    designs: jsonb('designs').$type<{
        secure_url: string, 
        public_id: string, 
    }>().notNull(), 
    approvalStatus: designApprovalStatusType('approval_status').default('pending'), 
    comment: text('comment'), 
   createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
   updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    campaignDesignsCampaignIdIdx: index('campaign_designs_campaign_id_idx').on(table.campaignId)
}))