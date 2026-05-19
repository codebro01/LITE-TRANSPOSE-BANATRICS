import { relations } from 'drizzle-orm';
import { campaignTable } from '@src/db/campaigns';
import { campaignDesignsTable } from '@src/db/campaign-designs';
import { weeklyProofTable } from '@src/db/weekly_proofs';
import { installmentProofTable } from './installment-proof';

export const campaignRelations = relations(campaignTable, ({ many }) => ({
  weeklyProofs: many(weeklyProofTable),
  campaignDesigns: many(campaignDesignsTable),
  installmentProof: many(installmentProofTable)
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


export const installmentProofRelations = relations(
  installmentProofTable,
  ({ one }) => ({
    campaign: one(campaignTable, {
      fields: [installmentProofTable.campaignId],
      references: [campaignTable.id],
    }),
  }),
);
