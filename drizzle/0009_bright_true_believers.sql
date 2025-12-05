CREATE TYPE "public"."driver_campaign_status_type" AS ENUM('active', 'completed', 'pending', 'due_soon');--> statement-breakpoint
CREATE TABLE "driver_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"campaignId" uuid
);
--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "call_to_action" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "availability" integer;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "state" varchar(100);--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "banner_details" jsonb;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "earning_per_driver" integer;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "requirements" text;--> statement-breakpoint
ALTER TABLE "driver_campaigns" ADD CONSTRAINT "driver_campaigns_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_campaigns" ADD CONSTRAINT "driver_campaigns_campaignId_campaigns_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;