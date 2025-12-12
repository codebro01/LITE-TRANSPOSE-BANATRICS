ALTER TABLE "bank_details" DROP CONSTRAINT "bank_details_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "bank_details" ADD CONSTRAINT "bank_details_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;