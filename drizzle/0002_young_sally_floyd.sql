ALTER TABLE "businessOwners" RENAME COLUMN "fullName" TO "businessEmail";--> statement-breakpoint
ALTER TABLE "businessOwners" ADD COLUMN "businessName" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "businessOwners" ADD COLUMN "businessLogo" varchar(255);--> statement-breakpoint
ALTER TABLE "businessOwners" DROP COLUMN "date_of_birth";--> statement-breakpoint
ALTER TABLE "businessOwners" DROP COLUMN "companyLogo";