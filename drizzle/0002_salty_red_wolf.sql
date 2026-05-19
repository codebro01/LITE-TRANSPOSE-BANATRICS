ALTER TABLE "campaigns" ADD COLUMN "sentCampaignStartEmail" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "driver_campaigns" ADD COLUMN "rejection_reason" text;