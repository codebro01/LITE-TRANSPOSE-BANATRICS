ALTER TABLE "campaigns" RENAME COLUMN "upload_media_files" TO "uploaded_images";--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "message" SET NOT NULL;