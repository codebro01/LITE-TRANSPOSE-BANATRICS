CREATE TYPE "public"."IDTypes" AS ENUM('nationalIdCard', 'internationalPassport', 'driversLicense', 'votersCard');--> statement-breakpoint
CREATE TYPE "public"."contactFrequencyType" AS ENUM('daily', 'weekly', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."preferredLanguage" AS ENUM('english', 'yoruba', 'hausa', 'igbo');--> statement-breakpoint
CREATE TYPE "public"."profileVisibilityType" AS ENUM('public', 'limited', 'private');--> statement-breakpoint
CREATE TYPE "public"."proofOfAddressType" AS ENUM('electricityBill', 'waterBill', 'bankStatement');--> statement-breakpoint
CREATE TYPE "public"."propertyType" AS ENUM('residential', 'apartment', 'land', 'commercial', 'newDevelopment', 'shortLet');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"displayName" varchar(255),
	"email" varchar(255) NOT NULL,
	"role" varchar(10) DEFAULT 'user' NOT NULL,
	"password" varchar(255) NOT NULL,
	"is_email_Verified" boolean DEFAULT false NOT NULL,
	"fullName" varchar(255),
	"date_of_birth" varchar(20),
	"gender" varchar(20),
	"dp" varchar(255),
	"phone" varchar(50),
	"address" varchar(255),
	"emergencyContact" varchar(255),
	"weight" varchar(50),
	"height" varchar(50),
	"bloodType" varchar(50),
	"authProvider" varchar(20) DEFAULT 'local' NOT NULL,
	"is_stage_complete" boolean DEFAULT false,
	"refreshToken" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
