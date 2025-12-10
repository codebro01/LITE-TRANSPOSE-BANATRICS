CREATE TYPE "public"."earning_payment_status_type" AS ENUM('PAID', 'UNPAID');--> statement-breakpoint
ALTER TYPE "public"."driver_campaign_status_type" ADD VALUE 'rejected';--> statement-breakpoint
ALTER TABLE "earnings" ALTER COLUMN "date_initiated" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "earnings" ALTER COLUMN "date_initiated" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "earnings" ALTER COLUMN "date_initiated" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "earnings" ALTER COLUMN "payment_method" SET DEFAULT 'transfer';--> statement-breakpoint
ALTER TABLE "earnings" ALTER COLUMN "payment_status" SET DEFAULT 'UNPAID';