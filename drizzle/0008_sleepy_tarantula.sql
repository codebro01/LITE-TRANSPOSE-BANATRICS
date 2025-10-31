ALTER TABLE "businessOwners" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "drivers" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "businessOwners" DROP CONSTRAINT "businessOwners_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "drivers" DROP CONSTRAINT "drivers_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "businessOwners" ADD CONSTRAINT "businessOwners_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;