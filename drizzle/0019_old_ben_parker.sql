CREATE TYPE "public"."design_approval_status_type" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."campaign_status_type" AS ENUM('draft', 'pending', 'approved', 'completed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."weekly_proof_status" AS ENUM('approved', 'pending_review', 'rejected', 'flagged');--> statement-breakpoint
CREATE TABLE "campaign_designs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaignId" uuid NOT NULL,
	"designs" jsonb NOT NULL,
	"approval_status" "design_approval_status_type" DEFAULT 'pending',
	"comment" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"fullName" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaignId" uuid,
	"userId" uuid,
	"status" varchar(100) DEFAULT 'pending',
	"amount" double precision NOT NULL,
	"due_date" timestamp DEFAULT now() NOT NULL,
	"invoice_id" varchar(50) NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "status_type" SET DATA TYPE "public"."campaign_status_type" USING "status_type"::text::"public"."campaign_status_type";--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "start_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "end_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "spent_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "earnings" ALTER COLUMN "payment_status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "drivers" ALTER COLUMN "approved_status" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "drivers" ALTER COLUMN "approved_status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "refreshToken" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "weekly_proofs" ALTER COLUMN "weekly_proof_status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "weekly_proofs" ALTER COLUMN "weekly_proof_status" SET DATA TYPE "public"."weekly_proof_status" USING "weekly_proof_status"::text::"public"."weekly_proof_status";--> statement-breakpoint
ALTER TABLE "weekly_proofs" ALTER COLUMN "weekly_proof_status" SET DEFAULT 'pending_review';--> statement-breakpoint
ALTER TABLE "weekly_proofs" ALTER COLUMN "weekly_proof_status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "active" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "print_house_phone_no" varchar(20);--> statement-breakpoint
ALTER TABLE "businessOwners" ADD COLUMN "business_owner_status" varchar(50) DEFAULT 'approved' NOT NULL;--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "active_status" varchar DEFAULT 'activated' NOT NULL;--> statement-breakpoint
ALTER TABLE "weekly_proofs" ADD COLUMN "week_number" integer;--> statement-breakpoint
ALTER TABLE "weekly_proofs" ADD COLUMN "year" integer;--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "campaign_designs" ADD CONSTRAINT "campaign_designs_campaignId_campaigns_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin" ADD CONSTRAINT "admin_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_campaignId_campaigns_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_userId_drivers_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."drivers"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
DROP TYPE "public"."status_type";--> statement-breakpoint
DROP TYPE "public"."earning_payment_status_type";--> statement-breakpoint
DROP TYPE "public"."weekly_proof_status_type";