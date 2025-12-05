ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT '{"businessOwner"}';--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "nin" varchar(12) NOT NULL;--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "state" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "lga" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "frontview" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "backview" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "sideview" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "driver_license" jsonb;--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "ownership_document" jsonb;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "password_reset_code";