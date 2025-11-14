ALTER TABLE "campaigns" ALTER COLUMN "payment_status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."payment_status";--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('spent', 'pending');--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "payment_status" SET DATA TYPE "public"."payment_status" USING "payment_status"::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "payment_status" DROP DEFAULT;