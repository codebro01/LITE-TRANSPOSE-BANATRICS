CREATE TYPE "public"."maintenance_type" AS ENUM('basic', 'standard', 'premium');--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "maintenance_type" "maintenance_type" NOT NULL;