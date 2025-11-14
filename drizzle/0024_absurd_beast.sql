ALTER TABLE "notifications" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "status" SET DATA TYPE "public"."notification_status_type" USING "status"::text::"public"."notification_status_type";--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "status" SET DEFAULT 'unread';--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "variant" "variant_type" DEFAULT 'info' NOT NULL;