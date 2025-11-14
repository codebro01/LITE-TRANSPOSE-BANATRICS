CREATE TYPE "public"."notification_status_type" AS ENUM('read', 'unread');--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "status_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."status_type";--> statement-breakpoint
CREATE TYPE "public"."status_type" AS ENUM('draft', 'active', 'pending', 'completed');--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "status_type" SET DATA TYPE "public"."status_type" USING "status_type"::"public"."status_type";