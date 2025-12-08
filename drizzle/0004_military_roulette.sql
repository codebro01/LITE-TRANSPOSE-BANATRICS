CREATE TABLE "vehicle_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"plate_number" varchar(255),
	"color" varchar(50) NOT NULL,
	"state" varchar(50) NOT NULL,
	"lga" varchar(50) NOT NULL,
	"vehicle_photos" jsonb[] NOT NULL,
	"year_of_manufacture" varchar(6) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vehicle_details_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
ALTER TABLE "drivers" RENAME COLUMN "full_name" TO "firstname";--> statement-breakpoint
ALTER TABLE "drivers" ALTER COLUMN "dp" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "lastname" varchar(255) DEFAULT 'lastname' NOT NULL;--> statement-breakpoint
ALTER TABLE "vehicle_details" ADD CONSTRAINT "vehicle_details_userId_drivers_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."drivers"("userId") ON DELETE no action ON UPDATE no action;