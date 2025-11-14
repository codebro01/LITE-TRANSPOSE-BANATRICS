CREATE TYPE "public"."category_type" AS ENUM('payment', 'campaign');--> statement-breakpoint
CREATE TYPE "public"."variant_type" AS ENUM('info', 'success', 'warning', 'danger');--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"title" text NOT NULL,
	"message" text,
	"status" "variant_type" DEFAULT 'info' NOT NULL,
	"category" "category_type" NOT NULL,
	"priority" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "status_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."status_type";--> statement-breakpoint
CREATE TYPE "public"."status_type" AS ENUM('read', 'unread');--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "status_type" SET DATA TYPE "public"."status_type" USING "status_type"::"public"."status_type";--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" DROP COLUMN "payment_amount";--> statement-breakpoint
ALTER TABLE "businessOwners" DROP COLUMN "moneySpent";