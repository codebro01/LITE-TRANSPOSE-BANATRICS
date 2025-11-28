ALTER TABLE "campaigns" ALTER COLUMN "duration" SET DEFAULT 30;--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "duration" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "package_type" "package_type" NOT NULL;