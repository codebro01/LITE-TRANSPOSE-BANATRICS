ALTER TABLE "campaigns" ALTER COLUMN "company_logo" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "upload_media_files" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "upload_media_files" SET DEFAULT '[]'::jsonb;