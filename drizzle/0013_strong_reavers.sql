CREATE TYPE "public"."payment_status" AS ENUM('spent', 'pending', 'null');--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "payment_status" "payment_status" DEFAULT 'null';--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "paymentAmount" integer;