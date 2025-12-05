ALTER TABLE "email_verifications" DROP CONSTRAINT "email_verifications_phone_unique";--> statement-breakpoint
ALTER TABLE "email_verifications" ALTER COLUMN "phone" DROP NOT NULL;