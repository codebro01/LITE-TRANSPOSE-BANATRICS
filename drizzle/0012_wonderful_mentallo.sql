ALTER TABLE "vehicle_details" DROP CONSTRAINT "vehicle_details_userId_drivers_userId_fk";
--> statement-breakpoint
ALTER TABLE "vehicle_details" ADD CONSTRAINT "vehicle_details_userId_drivers_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."drivers"("userId") ON DELETE cascade ON UPDATE no action;