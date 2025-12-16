ALTER TABLE "payments" DROP CONSTRAINT "payments_campaign_id_campaigns_id_fk";
--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "campaign_id";