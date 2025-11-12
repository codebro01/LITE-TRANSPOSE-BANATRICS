ALTER TABLE "businessOwners" ADD COLUMN "balance" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "businessOwners" ADD COLUMN "pending" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "balance" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "pending" integer DEFAULT 0 NOT NULL;