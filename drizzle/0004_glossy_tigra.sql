CREATE TABLE "drivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"role" varchar(10) DEFAULT 'user' NOT NULL,
	"fullName" varchar(255) NOT NULL,
	"refreshToken" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" varchar(50) NOT NULL,
	"role" varchar(50) DEFAULT 'driver' NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"is_email_Verified" boolean DEFAULT false NOT NULL,
	"refreshToken" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "businessOwners" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businessOwners" ADD CONSTRAINT "businessOwners_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businessOwners" DROP COLUMN "phone";--> statement-breakpoint
ALTER TABLE "businessOwners" DROP COLUMN "password";--> statement-breakpoint
ALTER TABLE "businessOwners" DROP COLUMN "is_email_Verified";--> statement-breakpoint
ALTER TABLE "businessOwners" DROP COLUMN "businessEmail";