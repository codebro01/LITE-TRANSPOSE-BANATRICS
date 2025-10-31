ALTER TABLE "campaigns" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "campaigns" DROP CONSTRAINT "campaigns_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;