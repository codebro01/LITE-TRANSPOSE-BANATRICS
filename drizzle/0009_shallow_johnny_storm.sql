CREATE TYPE "public"."approval_status_type" AS ENUM('REJECTED', 'APPROVED', 'UNAPPROVED');--> statement-breakpoint
ALTER TABLE "earnings" ADD COLUMN "userId" uuid;--> statement-breakpoint
ALTER TABLE "earnings" ADD COLUMN "rejection_reason" varchar(255);--> statement-breakpoint
ALTER TABLE "earnings" ADD COLUMN "approved" "approval_status_type" DEFAULT 'UNAPPROVED';--> statement-breakpoint
ALTER TABLE "earnings" ADD CONSTRAINT "earnings_userId_drivers_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."drivers"("userId") ON DELETE cascade ON UPDATE no action;