CREATE TABLE "businessOwners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" varchar(50) NOT NULL,
	"role" varchar(10) DEFAULT 'user' NOT NULL,
	"password" varchar(255) NOT NULL,
	"is_email_Verified" boolean DEFAULT false NOT NULL,
	"fullName" varchar(255) NOT NULL,
	"date_of_birth" varchar(20) NOT NULL,
	"businessAddress" varchar(255),
	"companyLogo" varchar(255),
	"refreshToken" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
DROP TYPE "public"."IDTypes";--> statement-breakpoint
DROP TYPE "public"."contactFrequencyType";--> statement-breakpoint
DROP TYPE "public"."preferredLanguage";--> statement-breakpoint
DROP TYPE "public"."profileVisibilityType";--> statement-breakpoint
DROP TYPE "public"."proofOfAddressType";--> statement-breakpoint
DROP TYPE "public"."propertyType";