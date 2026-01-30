import { campaignTable } from '@src/db/campaigns';
import { driverTable } from '@src/db/users';
import {
  pgTable,
  uuid,
  text,
  pgEnum,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';

export const installmentProofStatus = pgEnum('installment_proof_status', [
  'pending_approval',
  'approved',
  'rejected',
]);

export const installmentProofTable = pgTable('installment_proofs', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),

  campaignId: uuid('campaignId')
    .references(() => campaignTable.id, { onDelete: 'cascade' })
    .notNull(),
  userId: uuid('userId')
    .references(() => driverTable.userId, { onDelete: 'cascade' })
    .notNull(),
  // frontview: jsonb('frontview')
  //   .$type<{
  //     secure_url: string;
  //     public_id: string;
  //   }>()
  //   .notNull(),
  backview: jsonb('backview')
    .$type<{
      secure_url: string;
      public_id: string;
    }>()
    .notNull(),
  comment: text('comment'),
  statusType: installmentProofStatus('installment_proof_status')
    .notNull()
    .default('pending_approval'),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export type installmentProofInsertType = typeof installmentProofTable.$inferInsert;
