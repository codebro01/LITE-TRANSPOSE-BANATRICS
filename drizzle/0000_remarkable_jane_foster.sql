CREATE TYPE "public"."maintenance_type" AS ENUM('basic', 'standard', 'premium');--> statement-breakpoint
CREATE TYPE "public"."package_type" AS ENUM('starter', 'basic', 'premium', 'custom');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('spent', 'pending');--> statement-breakpoint
CREATE TYPE "public"."status_type" AS ENUM('draft', 'active', 'pending', 'completed');--> statement-breakpoint
CREATE TYPE "public"."category_type" AS ENUM('payment', 'campaign');--> statement-breakpoint
CREATE TYPE "public"."notification_status_type" AS ENUM('read', 'unread');--> statement-breakpoint
CREATE TYPE "public"."variant_type" AS ENUM('info', 'success', 'warning', 'danger');--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"package_type" "package_type",
	"status_type" "status_type",
	"payment_status" "payment_status",
	"duration" integer DEFAULT 30 NOT NULL,
	"revisions" varchar,
	"maintenance_type" "maintenance_type",
	"lga_coverage" varchar(10),
	"price" integer,
	"no_of_drivers" integer,
	"campaign_name" varchar(255),
	"campaign_descriptions" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"company_logo" jsonb,
	"color_pallete" varchar[],
	"call_to_action" varchar,
	"main_message" text,
	"response_on_seeing_banner" text,
	"uploaded_images" jsonb DEFAULT '[]'::jsonb,
	"slogan" varchar(500),
	"userId" uuid NOT NULL,
	"spent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verification_code" varchar NOT NULL,
	"expires_at" timestamp NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_verifications_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "businessOwners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid,
	"balance" double precision DEFAULT 0 NOT NULL,
	"pending" double precision DEFAULT 0 NOT NULL,
	"businessName" varchar(255) NOT NULL,
	"businessAddress" varchar(255),
	"businessLogo" varchar(255),
	"refreshToken" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid,
	"balance" double precision DEFAULT 0 NOT NULL,
	"pending" double precision DEFAULT 0 NOT NULL,
	"dp" varchar(255),
	"full_name" varchar(255) DEFAULT 'Null Driver' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" varchar(50) NOT NULL,
	"role" varchar(50)[] DEFAULT '{"driver"}' NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"is_email_Verified" boolean DEFAULT false NOT NULL,
	"password_reset_code" varchar,
	"refreshToken" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"invoice_id" text,
	"reference" text,
	"campaign_name" text NOT NULL,
	"date_initiated" text,
	"amount" double precision NOT NULL,
	"payment_method" text NOT NULL,
	"payment_status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_resets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"email" varchar(255) NOT NULL,
	"password_reset_code" varchar NOT NULL,
	"expires_at" timestamp NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "password_resets_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "password_resets_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"status" "notification_status_type" DEFAULT 'unread' NOT NULL,
	"variant" "variant_type" DEFAULT 'info' NOT NULL,
	"category" "category_type" NOT NULL,
	"priority" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"adminId" uuid NOT NULL,
	"package_type" "package_type" NOT NULL,
	"maintenance_type" "maintenance_type" NOT NULL,
	"duration" integer NOT NULL,
	"revisions" varchar NOT NULL,
	"price" integer NOT NULL,
	"lga_coverage" varchar(10) NOT NULL,
	"no_of_drivers" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businessOwners" ADD CONSTRAINT "businessOwners_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_adminId_users_id_fk" FOREIGN KEY ("adminId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_expires_idx" ON "email_verifications" USING btree ("email","expires_at");--> statement-breakpoint
CREATE INDEX "expires_at_idx" ON "email_verifications" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "email_verification_code_epxps" ON "password_resets" USING btree ("email","expires_at");--> statement-breakpoint
CREATE INDEX "email_code_expires_at_idx" ON "password_resets" USING btree ("expires_at");