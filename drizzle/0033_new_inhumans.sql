CREATE TABLE "email_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"email" varchar(255) NOT NULL,
	"email_verification_code" varchar NOT NULL,
	"expires_at" timestamp NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_verifications_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "email_verifications_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DROP INDEX "email_expires_idx";--> statement-breakpoint
DROP INDEX "expires_at_idx";--> statement-breakpoint
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_expires_idx" ON "email_verifications" USING btree ("email","expires_at");--> statement-breakpoint
CREATE INDEX "expires_at_idx" ON "email_verifications" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "email_verification_code_epxps" ON "password_resets" USING btree ("email","expires_at");--> statement-breakpoint
CREATE INDEX "email_code_expires_at_idx" ON "password_resets" USING btree ("expires_at");