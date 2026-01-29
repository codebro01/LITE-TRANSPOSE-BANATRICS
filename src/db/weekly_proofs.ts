import { campaignTable } from '@src/db/campaigns';
import { driverTable } from '@src/db/users';
import {
  pgTable,
  uuid,
  text,
  pgEnum,
  timestamp,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core';

export const weeklyProofStatusType = pgEnum('weekly_proof_status', [
  'approved',
  'pending_review',
  'rejected',
  'flagged'
]);

export const weeklyProofTable = pgTable('weekly_proofs', {
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
  // sideview: jsonb('sideview')
  //   .$type<{
  //     secure_url: string;
  //     public_id: string;
  //   }>()
  //   .notNull(),
  comment: text('comment'),
  month: integer('month'),
  weekNumber: integer('week_number'),
  year: integer('year'), 
  statusType: weeklyProofStatusType('weekly_proof_status')
    .notNull()
    .default('pending_review'),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type weeklyProofInsertType = typeof weeklyProofTable.$inferInsert;
