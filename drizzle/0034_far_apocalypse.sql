ALTER TABLE "email_verifications" DROP CONSTRAINT "email_verifications_user_id_unique";--> statement-breakpoint
ALTER TABLE "email_verifications" DROP CONSTRAINT "email_verifications_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "full_name" varchar(255) DEFAULT 'Null Driver' NOT NULL;--> statement-breakpoint
ALTER TABLE "email_verifications" DROP COLUMN "user_id";