CREATE TABLE "packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"adminId" uuid,
	"duration" integer,
	"revisions" varchar,
	"price" integer,
	"lga_coverage" varchar(10),
	"no_of_drivers" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "businessOwners" DROP CONSTRAINT "businessOwners_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "drivers" DROP CONSTRAINT "drivers_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "duration" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_adminId_users_id_fk" FOREIGN KEY ("adminId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businessOwners" ADD CONSTRAINT "businessOwners_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drivers" DROP COLUMN "role";--> statement-breakpoint
ALTER TABLE "drivers" DROP COLUMN "fullName";--> statement-breakpoint
ALTER TABLE "drivers" DROP COLUMN "refreshToken";