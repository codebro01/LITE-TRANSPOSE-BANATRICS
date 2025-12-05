ALTER TABLE "email_verifications" ALTER COLUMN "phone" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_phone_unique" UNIQUE("phone");