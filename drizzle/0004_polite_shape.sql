ALTER TABLE "email_verifications" ADD COLUMN "phone" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "email_verifications" ADD COLUMN "nin" varchar(255);--> statement-breakpoint
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_phone_unique" UNIQUE("phone");--> statement-breakpoint
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_nin_unique" UNIQUE("nin");