ALTER TABLE "businessOwners" ALTER COLUMN "role" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "businessOwners" ALTER COLUMN "role" SET DEFAULT 'driver';--> statement-breakpoint
ALTER TABLE "businessOwners" ALTER COLUMN "businessEmail" SET DATA TYPE varchar(255);