CREATE TYPE "public"."package_type" AS ENUM('starter', 'basic', 'premium', 'custom', 'grand');--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "package_type" SET DATA TYPE "public"."package_type" USING "package_type"::text::"public"."package_type";--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "payment_status" SET DATA TYPE boolean;--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "payment_status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "refreshToken" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "packages" ALTER COLUMN "package_type" SET DATA TYPE "public"."package_type" USING "package_type"::text::"public"."package_type";--> statement-breakpoint
DROP TYPE "public"."campaign_package_type";