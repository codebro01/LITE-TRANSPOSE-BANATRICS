CREATE TYPE "public"."design_approval_status_type" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."package_type" AS ENUM('starter', 'basic', 'premium', 'custom', 'grand');--> statement-breakpoint
CREATE TYPE "public"."campaign_status_type" AS ENUM('draft', 'pending', 'approved', 'completed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."maintenance_type" AS ENUM('basic', 'standard', 'premium');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('spent', 'pending');--> statement-breakpoint
CREATE TYPE "public"."driver_campaign_status_type" AS ENUM('completed', 'pending_approval', 'due_soon', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."approval_status_type" AS ENUM('REJECTED', 'APPROVED', 'UNAPPROVED');--> statement-breakpoint
CREATE TYPE "public"."weekly_proof_status" AS ENUM('approved', 'pending_review', 'rejected', 'flagged');--> statement-breakpoint
CREATE TYPE "public"."installment_proof_status" AS ENUM('pending_approval', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."category_type" AS ENUM('payment', 'campaign');--> statement-breakpoint
CREATE TYPE "public"."notification_status_type" AS ENUM('read', 'unread');--> statement-breakpoint
CREATE TYPE "public"."variant_type" AS ENUM('info', 'success', 'warning', 'danger');--> statement-breakpoint
CREATE TABLE "bank_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"account_number" varchar(10) NOT NULL,
	"account_name" varchar(255) NOT NULL,
	"bank_name" varchar(255),
	"bankId" integer,
	"bank_code" varchar(10) NOT NULL,
	"transfer_recipient_code" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "bank_details_userId_unique" UNIQUE("userId"),
	CONSTRAINT "bank_details_transfer_recipient_code_unique" UNIQUE("transfer_recipient_code")
);
--> statement-breakpoint
CREATE TABLE "campaign_designs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaignId" uuid NOT NULL,
	"designs" jsonb NOT NULL,
	"approval_status" "design_approval_status_type" DEFAULT 'pending',
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"package_type" "package_type",
	"status_type" "campaign_status_type",
	"payment_status" boolean DEFAULT false NOT NULL,
	"duration" integer DEFAULT 30 NOT NULL,
	"revisions" varchar,
	"maintenance_type" "maintenance_type",
	"lga_coverage" varchar(10),
	"price" integer,
	"no_of_drivers" integer,
	"availability" integer,
	"campaign_name" varchar(255),
	"campaign_descriptions" text,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"company_logo" jsonb,
	"state" varchar(100),
	"banner_details" jsonb,
	"earning_per_driver" integer,
	"color_pallete" varchar[],
	"call_to_action" text,
	"requirements" text,
	"main_message" text,
	"active" boolean DEFAULT false,
	"response_on_seeing_banner" text,
	"uploaded_images" jsonb DEFAULT '[]'::jsonb,
	"slogan" varchar(500),
	"print_house_phone_no" varchar(20),
	"spent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "driver_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"campaignId" uuid NOT NULL,
	"campaign_status" "driver_campaign_status_type" DEFAULT 'pending_approval',
	"payment_status" boolean DEFAULT false,
	"active_status" boolean DEFAULT false,
	"start_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "earnings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaignId" uuid,
	"userId" uuid,
	"amount" double precision NOT NULL,
	"reference" text,
	"date_initiated" timestamp DEFAULT now() NOT NULL,
	"payment_method" text DEFAULT 'transfer' NOT NULL,
	"recipient_code" varchar(255) NOT NULL,
	"rejection_reason" varchar(255),
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"approved" "approval_status_type" DEFAULT 'UNAPPROVED',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(255) NOT NULL,
	"nin" varchar(255),
	"email_verification_code" varchar NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "email_verifications_email_unique" UNIQUE("email"),
	CONSTRAINT "email_verifications_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "admin" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"fullName" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "admin_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "businessOwners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"balance" double precision DEFAULT 0 NOT NULL,
	"pending" double precision DEFAULT 0 NOT NULL,
	"totalSpent" double precision DEFAULT 0 NOT NULL,
	"businessName" varchar(255) NOT NULL,
	"businessAddress" varchar(255),
	"businessLogo" varchar(255),
	"refreshToken" varchar(255),
	"business_owner_status" varchar(50) DEFAULT 'approved' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "businessOwners_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"firstname" varchar(255) DEFAULT 'firstname' NOT NULL,
	"lastname" varchar(255) DEFAULT 'lastname' NOT NULL,
	"approved_status" varchar(20) DEFAULT 'pending' NOT NULL,
	"active_status" varchar DEFAULT 'activated' NOT NULL,
	"balance" double precision DEFAULT 0 NOT NULL,
	"pending" double precision DEFAULT 0 NOT NULL,
	"dp" jsonb,
	"nin" varchar(12) NOT NULL,
	"state" varchar(50) NOT NULL,
	"lga" varchar(50) NOT NULL,
	"address" varchar(255),
	"frontview" jsonb NOT NULL,
	"backview" jsonb NOT NULL,
	"sideview" jsonb NOT NULL,
	"driver_license" jsonb,
	"ownership_document" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "drivers_userId_unique" UNIQUE("userId"),
	CONSTRAINT "drivers_nin_unique" UNIQUE("nin")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" varchar(50) NOT NULL,
	"role" varchar(50)[] DEFAULT '{"businessOwner"}' NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"is_email_Verified" boolean DEFAULT false NOT NULL,
	"refreshToken" varchar,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"invoice_id" text,
	"reference" text,
	"date_initiated" timestamp with time zone DEFAULT now(),
	"amount" double precision NOT NULL,
	"payment_method" text NOT NULL,
	"payment_status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
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
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "password_resets_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "password_resets_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "weekly_proofs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaignId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"backview" jsonb NOT NULL,
	"comment" text,
	"month" integer,
	"week_number" integer,
	"year" integer,
	"weekly_proof_status" "weekly_proof_status" DEFAULT 'pending_review' NOT NULL,
	"rejection_reason" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vehicle_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"plate_number" varchar(255),
	"color" varchar(50) NOT NULL,
	"state" varchar(50) NOT NULL,
	"lga" varchar(50) NOT NULL,
	"vehicle_photos" jsonb[] NOT NULL,
	"year_of_manufacture" varchar(6) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "vehicle_details_userId_unique" UNIQUE("userId")
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
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "installment_proofs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaignId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"backview" jsonb NOT NULL,
	"comment" text,
	"installment_proof_status" "installment_proof_status" DEFAULT 'pending_approval' NOT NULL,
	"rejection_reason" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"status" "notification_status_type" DEFAULT 'unread' NOT NULL,
	"variant" "variant_type" DEFAULT 'info' NOT NULL,
	"role" varchar(50) DEFAULT 'businessOwner' NOT NULL,
	"category" "category_type" NOT NULL,
	"priority" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"adminId" uuid NOT NULL,
	"package_type" "package_type" NOT NULL,
	"maintenance_type" "maintenance_type" NOT NULL,
	"duration" integer NOT NULL,
	"revisions" varchar NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"no_of_drivers" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "bank_details" ADD CONSTRAINT "bank_details_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_designs" ADD CONSTRAINT "campaign_designs_campaignId_campaigns_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_campaigns" ADD CONSTRAINT "driver_campaigns_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_campaigns" ADD CONSTRAINT "driver_campaigns_campaignId_campaigns_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "earnings" ADD CONSTRAINT "earnings_campaignId_campaigns_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "earnings" ADD CONSTRAINT "earnings_userId_drivers_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."drivers"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin" ADD CONSTRAINT "admin_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businessOwners" ADD CONSTRAINT "businessOwners_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_proofs" ADD CONSTRAINT "weekly_proofs_campaignId_campaigns_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_proofs" ADD CONSTRAINT "weekly_proofs_userId_drivers_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."drivers"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_details" ADD CONSTRAINT "vehicle_details_userId_drivers_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."drivers"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_campaignId_campaigns_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installment_proofs" ADD CONSTRAINT "installment_proofs_campaignId_campaigns_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installment_proofs" ADD CONSTRAINT "installment_proofs_userId_drivers_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."drivers"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_adminId_users_id_fk" FOREIGN KEY ("adminId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bank_details_user_id_idx" ON "bank_details" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "campaign_designs_campaign_id_idx" ON "campaign_designs" USING btree ("campaignId");--> statement-breakpoint
CREATE INDEX "campaign_user_id_idx" ON "campaigns" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "campaign_id_user_id_idx" ON "campaigns" USING btree ("userId","id");--> statement-breakpoint
CREATE INDEX "campaign_drafts_by_id_idx" ON "campaigns" USING btree ("userId","status_type");--> statement-breakpoint
CREATE INDEX "campaigns_status_idx" ON "campaigns" USING btree ("status_type");--> statement-breakpoint
CREATE INDEX "campaigns_payment_status_active_idx" ON "campaigns" USING btree ("id","status_type","active");--> statement-breakpoint
CREATE INDEX "campaigns_status_active_idx" ON "campaigns" USING btree ("status_type","active");--> statement-breakpoint
CREATE INDEX "idx_campaign_status_payment" ON "campaigns" USING btree ("status_type","payment_status");--> statement-breakpoint
CREATE INDEX "idx_campaign_status_payment_userId" ON "campaigns" USING btree ("userId","status_type","payment_status");--> statement-breakpoint
CREATE INDEX "idx_campaign_userId_paymentStatus_spentAt" ON "campaigns" USING btree ("userId","payment_status","spent_at");--> statement-breakpoint
CREATE INDEX "idx_campaign_active_payment " ON "campaigns" USING btree ("active","payment_status");--> statement-breakpoint
CREATE INDEX "idx_campaign_id_userId " ON "campaigns" USING btree ("id","userId");--> statement-breakpoint
CREATE INDEX "idx_driver_campaign_userId_campaignId " ON "driver_campaigns" USING btree ("campaignId","userId");--> statement-breakpoint
CREATE INDEX "idx_driver_campaign_userId " ON "driver_campaigns" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_driver_campaign_campaignId " ON "driver_campaigns" USING btree ("campaignId");--> statement-breakpoint
CREATE INDEX "idx_driver_campaign_status" ON "driver_campaigns" USING btree ("campaign_status","userId");--> statement-breakpoint
CREATE INDEX "idx_driver_campaign_userId_active_campaign_status" ON "driver_campaigns" USING btree ("campaign_status","userId","active_status");--> statement-breakpoint
CREATE INDEX "idx_driver_campaign_userId_active_campaign_status_campaignId" ON "driver_campaigns" USING btree ("campaign_status","userId","active_status","campaignId");--> statement-breakpoint
CREATE INDEX "idx_earnings_userId_approved" ON "earnings" USING btree ("userId","approved");--> statement-breakpoint
CREATE INDEX "idx_earnings_approved" ON "earnings" USING btree ("approved");--> statement-breakpoint
CREATE INDEX "idx_earnings_userId" ON "earnings" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_earnings_userId_updatedAt_approved" ON "earnings" USING btree ("userId","updated_at","approved");--> statement-breakpoint
CREATE INDEX "idx_earnings_userId_approved_recipientCode" ON "earnings" USING btree ("userId","recipient_code","approved");--> statement-breakpoint
CREATE INDEX "email_expires_idx" ON "email_verifications" USING btree ("email","expires_at");--> statement-breakpoint
CREATE INDEX "expires_at_idx" ON "email_verifications" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_emailVerification_email" ON "email_verifications" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_emailVerification_email_used" ON "email_verifications" USING btree ("email","used");--> statement-breakpoint
CREATE INDEX "idx_businessOwners_userId" ON "businessOwners" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_businessOwners_userId_balance" ON "businessOwners" USING btree ("userId","balance");--> statement-breakpoint
CREATE INDEX "idx_drivers_userId" ON "drivers" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_phone" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_users_phone_email" ON "users" USING btree ("email","phone");--> statement-breakpoint
CREATE INDEX "idx_payments_reference_userId" ON "payments" USING btree ("userId","reference");--> statement-breakpoint
CREATE INDEX "idx_payments_userId" ON "payments" USING btree ("userId","userId");--> statement-breakpoint
CREATE INDEX "idx_payments_reference" ON "payments" USING btree ("reference");--> statement-breakpoint
CREATE INDEX "email_verification_code_epxps" ON "password_resets" USING btree ("email","expires_at");--> statement-breakpoint
CREATE INDEX "email_code_expires_at_idx" ON "password_resets" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_passwordReset_email" ON "password_resets" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_passwordReset_email_used" ON "password_resets" USING btree ("email","used");--> statement-breakpoint
CREATE INDEX "idx_passwordReset_userId" ON "password_resets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_weeklyProofs_userId" ON "weekly_proofs" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_weeklyProofs_userId_id" ON "weekly_proofs" USING btree ("id","userId");--> statement-breakpoint
CREATE INDEX "idx_weeklyProofs_userId_campaignId_year_weekNumber" ON "weekly_proofs" USING btree ("userId","campaignId","week_number","year");--> statement-breakpoint
CREATE INDEX "idx_vehicleDetails_userId" ON "vehicle_details" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_vehicleDetails_userId_id" ON "vehicle_details" USING btree ("userId","id");--> statement-breakpoint
CREATE INDEX "idx_invoices_campaignId_userId" ON "invoices" USING btree ("campaignId","userId");--> statement-breakpoint
CREATE INDEX "idx_installmentProofs_userId_campaignId" ON "installment_proofs" USING btree ("userId","campaignId");--> statement-breakpoint
CREATE INDEX "idx_installmentProofs_userId_campaignId_statusType" ON "installment_proofs" USING btree ("userId","campaignId","installment_proof_status");--> statement-breakpoint
CREATE INDEX "idx_notifications_role_userId" ON "notifications" USING btree ("userId","role");--> statement-breakpoint
CREATE INDEX "idx_notifications_id_userId" ON "notifications" USING btree ("userId","id");--> statement-breakpoint
CREATE INDEX "idx_notifications_userId" ON "notifications" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_notifications_userId_status_category" ON "notifications" USING btree ("userId","category","status");--> statement-breakpoint
CREATE INDEX "idx_notifications_userId_status" ON "notifications" USING btree ("userId","status");--> statement-breakpoint
CREATE INDEX "idx_notifications_userId_category" ON "notifications" USING btree ("userId","category");