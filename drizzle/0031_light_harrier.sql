ALTER TABLE "packages" ALTER COLUMN "adminId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "packages" ALTER COLUMN "duration" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "packages" ALTER COLUMN "revisions" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "packages" ALTER COLUMN "price" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "packages" ALTER COLUMN "lga_coverage" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "packages" ALTER COLUMN "no_of_drivers" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "maintenance_type" "maintenance_type";--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "lga_coverage" varchar(10);