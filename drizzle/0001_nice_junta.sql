DROP INDEX "email_code_expires_at_idx";--> statement-breakpoint
DROP INDEX "email_verification_code_epxps";--> statement-breakpoint
DROP INDEX "email_expires_idx";--> statement-breakpoint
DROP INDEX "expires_at_idx";--> statement-breakpoint
ALTER TABLE "weekly_proofs" ADD CONSTRAINT "weekly_proofs_userId_drivers_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."drivers"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_code_expires_at_idx" ON "password_resets" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "email_verification_code_epxps" ON "password_resets" USING btree ("email","expires_at");--> statement-breakpoint
CREATE INDEX "email_expires_idx" ON "email_verifications" USING btree ("email","expires_at");--> statement-breakpoint
CREATE INDEX "expires_at_idx" ON "email_verifications" USING btree ("expires_at");--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_userId_unique" UNIQUE("userId");