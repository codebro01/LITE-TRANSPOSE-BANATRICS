CREATE TYPE "public"."package_type" AS ENUM('starter', 'basic', 'premium', 'custom');--> statement-breakpoint
CREATE TYPE "public"."status_type" AS ENUM('draft', 'active', 'pending', 'completed');--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"package_type" "package_type",
	"status_type" "status_type",
	"duration" varchar,
	"revisions" varchar,
	"price" integer,
	"no_of_drivers" integer,
	"campaign_name" varchar(255),
	"campaign_descriptions" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"company_logo" varchar,
	"color_pallete" varchar[],
	"call_to_action" varchar,
	"main_message" text,
	"response_on_seeing_banner" text,
	"upload_media_files" text[],
	"slogan" varchar(500),
	"user_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;