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
ALTER TABLE "users" ADD COLUMN "password_reset_code" varchar;--> statement-breakpoint
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_expires_idx" ON "password_resets" USING btree ("email","expires_at");--> statement-breakpoint
CREATE INDEX "expires_at_idx" ON "password_resets" USING btree ("expires_at");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_phone_unique" UNIQUE("phone");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");